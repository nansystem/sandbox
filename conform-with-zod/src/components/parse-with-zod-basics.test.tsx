import { describe, expect, it } from "vitest";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod/v4";

describe("parseWithZod — Zodスキーマでparse()を置き換える", () => {
  const SignupSchema = z.object({
    username: z.string().min(3, "3文字以上入力してください"),
    email: z.string().email("正しいメールアドレスを入力してください"),
  });

  it("バリデーション成功時のsubmissionを確認する", () => {
    const formData = new FormData();
    formData.set("username", "太郎太郎");
    formData.set("email", "taro@example.com");

    const submission = parseWithZod(formData, { schema: SignupSchema });

    expect(submission.status).toBe("success");

    if (submission.status === "success") {
      expect(submission.value.username).toBe("太郎太郎");
      expect(submission.value.email).toBe("taro@example.com");
    }
  });

  it("バリデーション失敗時のsubmissionを確認する", () => {
    const formData = new FormData();
    formData.set("username", "ab");
    formData.set("email", "invalid");

    const submission = parseWithZod(formData, { schema: SignupSchema });

    expect(submission.status).toBe("error");

    const result = submission.reply();
    expect(result.status).toBe("error");
    expect(result.error?.username).toContain("3文字以上入力してください");
    expect(result.error?.email).toContain("正しいメールアドレスを入力してください");
  });

  it("reply()のinitialValueにFormDataの値が入る", () => {
    const formData = new FormData();
    formData.set("username", "ab");
    formData.set("email", "invalid");

    const submission = parseWithZod(formData, { schema: SignupSchema });
    const result = submission.reply();

    expect(result.initialValue?.username).toBe("ab");
    expect(result.initialValue?.email).toBe("invalid");
  });
});

describe("parseWithZod vs 手動parse — 比較", () => {
  it("手動parse()のresolve()が不要になる", () => {
    // Zodなし（conform-without-zodでやっていた方法）:
    //
    // const submission = parse(formData, {
    //   resolve(payload) {
    //     const error: Record<string, string[]> = {};
    //     if (!payload.username) {
    //       error.username = ["ユーザー名は必須です"];
    //     }
    //     if (Object.keys(error).length > 0) {
    //       return { error };
    //     }
    //     return { value: payload };
    //   },
    // });
    //
    // Zodあり:
    // Conformは空文字をundefinedに変換するため、
    // z.string()のrequiredチェックでエラーになる
    const schema = z.object({
      username: z.string({ error: "ユーザー名は必須です" }),
    });

    const formData = new FormData();
    formData.set("username", "");

    const submission = parseWithZod(formData, { schema });
    const result = submission.reply();

    // resolve()の中でif文を書く代わりに、Zodスキーマが検証する
    expect(result.status).toBe("error");
    expect(result.error?.username).toContain("ユーザー名は必須です");
  });
});
