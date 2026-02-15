import { describe, expect, it } from "vitest";
import { parse } from "@conform-to/dom";

describe("parse() の詳細検証", () => {
  it("payloadの中身を確認する", () => {
    const formData = new FormData();
    formData.set("username", "太郎");
    formData.set("bio", "こんにちは");

    const submission = parse(formData, {
      resolve(payload) {
        console.log("=== payload ===", JSON.stringify(payload, null, 2));
        console.log("=== payload の型 ===", typeof payload);
        console.log("=== payload.username の型 ===", typeof payload.username);
        return { value: payload };
      },
    });

    // submission.payload も確認
    console.log("=== submission.payload ===", JSON.stringify(submission.payload, null, 2));
  });

  it("空文字のフィールドのpayloadを確認する", () => {
    const formData = new FormData();
    formData.set("username", "");
    formData.set("bio", "");

    parse(formData, {
      resolve(payload) {
        console.log("=== 空文字 payload ===", JSON.stringify(payload, null, 2));
        console.log("=== payload.username ===", JSON.stringify(payload.username));
        return { value: payload };
      },
    });
  });

  it("複数値のフィールド（checkbox等）のpayloadを確認する", () => {
    const formData = new FormData();
    formData.append("hobby", "読書");
    formData.append("hobby", "映画");

    parse(formData, {
      resolve(payload) {
        console.log("=== 複数値 payload ===", JSON.stringify(payload, null, 2));
        console.log("=== hobby の型 ===", Array.isArray(payload.hobby) ? "array" : typeof payload.hobby);
        return { value: payload };
      },
    });
  });

  it("error の Record<string, string[]> の中身を確認する", () => {
    const formData = new FormData();
    formData.set("username", "");
    formData.set("email", "invalid");

    const submission = parse(formData, {
      resolve(payload) {
        const error: Record<string, string[]> = {};

        if (!payload.username) {
          error.username = ["ユーザー名は必須です"];
        }
        // 1つのフィールドに複数エラー
        if (payload.email && !payload.email.includes("@")) {
          error.email = [
            "メールアドレスの形式が正しくありません",
            "@を含めてください",
          ];
        }

        console.log("=== error ===", JSON.stringify(error, null, 2));

        if (Object.keys(error).length > 0) {
          return { error };
        }
        return { value: payload };
      },
    });

    const result = submission.reply();
    console.log("=== reply().error ===", JSON.stringify(result.error, null, 2));
  });
});
