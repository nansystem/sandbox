import { describe, expect, it } from "vitest";
import { parse } from "@conform-to/dom";
import type { SubmissionResult } from "@conform-to/dom";

describe("parse() + submission.reply() の動作検証", () => {
  it("バリデーション成功時のsubmissionとreply", () => {
    const formData = new FormData();
    formData.set("username", "太郎");
    formData.set("bio", "こんにちは");

    const submission = parse(formData, {
      resolve(payload) {
        // バリデーション成功
        return { value: payload as { username: string; bio: string } };
      },
    });

    console.log("=== submission.status ===", submission.status);
    console.log("=== submission (keys) ===", Object.keys(submission));

    expect(submission.status).toBe("success");

    const result = submission.reply();
    console.log("=== reply() の結果 ===", JSON.stringify(result, null, 2));

    // reply() が返すオブジェクトの構造を確認
    expect(result.status).toBe("success");
  });

  it("バリデーション失敗時のsubmissionとreply", () => {
    const formData = new FormData();
    formData.set("username", "");
    formData.set("bio", "");

    const submission = parse(formData, {
      resolve(payload) {
        const error: Record<string, string[]> = {};

        if (!payload.username) {
          error.username = ["ユーザー名は必須です"];
        }

        if (Object.keys(error).length > 0) {
          return { error };
        }
        return { value: payload as { username: string; bio: string } };
      },
    });

    console.log("=== submission.status ===", submission.status);

    expect(submission.status).toBe("error");

    const result = submission.reply();
    console.log("=== reply() の結果 ===", JSON.stringify(result, null, 2));

    // SubmissionResult の構造を確認
    expect(result.status).toBe("error");
    expect(result.error?.username).toEqual(["ユーザー名は必須です"]);
    // initialValue にFormDataの値が入っているか
    console.log("=== initialValue ===", JSON.stringify(result.initialValue, null, 2));
  });

  it("reply() の結果はテストで手書きしたSubmissionResultと同じ構造", () => {
    const formData = new FormData();
    formData.set("username", "");
    formData.set("bio", "自己紹介です");

    const submission = parse(formData, {
      resolve(payload) {
        const error: Record<string, string[]> = {};
        if (!payload.username) {
          error.username = ["ユーザー名は必須です"];
        }
        if (Object.keys(error).length > 0) {
          return { error };
        }
        return { value: payload as { username: string; bio: string } };
      },
    });

    const result = submission.reply();

    // 手書きで作った場合と同じ構造か比較
    const handwritten: SubmissionResult<string[]> = {
      status: "error",
      initialValue: { username: "", bio: "自己紹介です" },
      error: {
        username: ["ユーザー名は必須です"],
      },
    };

    // status, error は一致するはず
    expect(result.status).toBe(handwritten.status);
    expect(result.error).toEqual(handwritten.error);
    // initialValue も同じ値が入るか
    console.log("=== reply() initialValue ===", JSON.stringify(result.initialValue));
    console.log("=== 手書き initialValue ===", JSON.stringify(handwritten.initialValue));
  });

  it("フォームエラー（空文字キー）もreply()で返せる", () => {
    const formData = new FormData();
    formData.set("username", "太郎");

    const submission = parse(formData, {
      resolve(payload) {
        // フィールドは問題ないが、フォーム全体のエラー
        return {
          error: {
            "": ["サーバーエラーが発生しました"],
          } as Record<string, string[]>,
        };
      },
    });

    const result = submission.reply();
    console.log("=== フォームエラー reply() ===", JSON.stringify(result, null, 2));

    expect(result.status).toBe("error");
    expect(result.error?.[""]).toEqual(["サーバーエラーが発生しました"]);
  });
});
