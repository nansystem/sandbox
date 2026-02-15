import { describe, expect, it } from "vitest";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod/v4";

describe("superRefine + parseWithZod — フィールド間バリデーション", () => {
  const PasswordSchema = z
    .object({
      password: z.string().min(8, "8文字以上入力してください"),
      confirmPassword: z.string(),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "パスワードが一致しません",
        });
      }
    });

  it("パスワードが一致するときはsuccess", () => {
    const formData = new FormData();
    formData.set("password", "mypassword123");
    formData.set("confirmPassword", "mypassword123");

    const submission = parseWithZod(formData, { schema: PasswordSchema });

    expect(submission.status).toBe("success");
  });

  it("パスワードが不一致のときerrorがconfirmPasswordに紐づく", () => {
    const formData = new FormData();
    formData.set("password", "mypassword123");
    formData.set("confirmPassword", "different");

    const submission = parseWithZod(formData, { schema: PasswordSchema });
    const result = submission.reply();

    expect(result.status).toBe("error");
    // superRefineのpath: ["confirmPassword"]がConformのフィールドエラーにマッピングされる
    expect(result.error?.confirmPassword).toContain("パスワードが一致しません");
    // password側にはエラーがない
    expect(result.error?.password).toBeUndefined();
  });

  it("passwordが短い＋不一致の場合、両方のエラーが出る", () => {
    const formData = new FormData();
    formData.set("password", "short");
    formData.set("confirmPassword", "different");

    const submission = parseWithZod(formData, { schema: PasswordSchema });
    const result = submission.reply();

    expect(result.status).toBe("error");
    console.log("=== 複合エラー ===", JSON.stringify(result.error, null, 2));
    // passwordにmin(8)のエラー
    expect(result.error?.password).toContain("8文字以上入力してください");
  });
});

describe("superRefine + parseWithZod — 条件付き必須フィールド", () => {
  const ContactSchema = z
    .object({
      contactMethod: z.enum(["email", "phone"]),
      email: z.string().optional(),
      phone: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.contactMethod === "email" && !data.email) {
        ctx.addIssue({
          code: "custom",
          path: ["email"],
          message: "メールアドレスを入力してください",
        });
      }
      if (data.contactMethod === "phone" && !data.phone) {
        ctx.addIssue({
          code: "custom",
          path: ["phone"],
          message: "電話番号を入力してください",
        });
      }
    });

  it("emailを選択してemail未入力のとき、emailにエラーが出る", () => {
    const formData = new FormData();
    formData.set("contactMethod", "email");
    // emailは未設定

    const submission = parseWithZod(formData, { schema: ContactSchema });
    const result = submission.reply();

    expect(result.status).toBe("error");
    expect(result.error?.email).toContain("メールアドレスを入力してください");
    expect(result.error?.phone).toBeUndefined();
  });

  it("phoneを選択してphone入力済みのとき、success", () => {
    const formData = new FormData();
    formData.set("contactMethod", "phone");
    formData.set("phone", "090-1234-5678");

    const submission = parseWithZod(formData, { schema: ContactSchema });

    expect(submission.status).toBe("success");
    if (submission.status === "success") {
      expect(submission.value.contactMethod).toBe("phone");
      expect(submission.value.phone).toBe("090-1234-5678");
    }
  });
});
