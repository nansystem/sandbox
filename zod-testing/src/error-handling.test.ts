import { z } from "zod";

describe("エラーハンドリング", () => {
  describe("safeParse", () => {
    it("成功時はsuccessがtrueでdataにアクセスできる", () => {
      const schema = z.string();
      const result = schema.safeParse("hello");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("hello");
      }
    });

    it("失敗時はsuccessがfalseでerrorにアクセスできる", () => {
      const schema = z.string();
      const result = schema.safeParse(123);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(z.ZodError);
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe("ZodError の構造", () => {
    it("issuesに個々のエラー情報が格納される", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });
      const result = schema.safeParse({ name: 123, age: "twenty" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBe(2);

        const nameIssue = result.error.issues.find(
          (i) => i.path[0] === "name"
        );
        expect(nameIssue).toBeDefined();
        expect(nameIssue!.code).toBe("invalid_type");

        const ageIssue = result.error.issues.find(
          (i) => i.path[0] === "age"
        );
        expect(ageIssue).toBeDefined();
        expect(ageIssue!.code).toBe("invalid_type");
      }
    });

    it("ネストされたパスも正しく報告される", () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            age: z.number(),
          }),
        }),
      });

      const result = schema.safeParse({
        user: { profile: { age: "invalid" } },
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual([
          "user",
          "profile",
          "age",
        ]);
      }
    });
  });

  describe("カスタムエラーメッセージ", () => {
    it("各バリデーションにカスタムメッセージを設定できる", () => {
      const schema = z.object({
        name: z.string({ required_error: "名前は必須です" }),
        age: z
          .number({ invalid_type_error: "年齢は数値で入力してください" })
          .min(0, { message: "年齢は0以上です" })
          .max(150, { message: "年齢は150以下です" }),
        email: z
          .string()
          .email({ message: "正しいメールアドレスを入力してください" }),
      });

      const result = schema.safeParse({
        name: undefined,
        age: -1,
        email: "not-email",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message);
        expect(messages).toContain("年齢は0以上です");
        expect(messages).toContain(
          "正しいメールアドレスを入力してください"
        );
      }
    });
  });

  describe("flatten / format", () => {
    it("flattenでフォーム向けの平坦なエラー構造を取得する", () => {
      const schema = z.object({
        name: z.string().min(1, "名前は必須です"),
        email: z.string().email("正しいメールアドレスを入力してください"),
      });

      const result = schema.safeParse({ name: "", email: "bad" });
      expect(result.success).toBe(false);
      if (!result.success) {
        const flat = result.error.flatten();
        expect(flat.fieldErrors.name).toBeDefined();
        expect(flat.fieldErrors.name![0]).toBe("名前は必須です");
        expect(flat.fieldErrors.email).toBeDefined();
        expect(flat.fieldErrors.email![0]).toBe(
          "正しいメールアドレスを入力してください"
        );
      }
    });

    it("formErrorsはルートレベルのエラーを含む", () => {
      const schema = z
        .object({
          password: z.string(),
          confirm: z.string(),
        })
        .refine((data) => data.password === data.confirm, {
          message: "パスワードが一致しません",
        });

      const result = schema.safeParse({
        password: "abc",
        confirm: "xyz",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const flat = result.error.flatten();
        expect(flat.formErrors).toContain("パスワードが一致しません");
      }
    });

    it("formatでネストされたエラー構造を取得する", () => {
      const schema = z.object({
        user: z.object({
          name: z.string().min(1, "名前は必須です"),
          age: z.number().min(0, "0以上"),
        }),
      });

      const result = schema.safeParse({
        user: { name: "", age: -1 },
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const formatted = result.error.format();
        expect(formatted.user?.name?._errors).toContain("名前は必須です");
        expect(formatted.user?.age?._errors).toContain("0以上");
      }
    });
  });

  describe("エラーマップ", () => {
    it("カスタムエラーマップでグローバルにメッセージを変更する", () => {
      const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
        if (issue.code === z.ZodIssueCode.invalid_type) {
          if (issue.expected === "string") {
            return { message: "文字列を入力してください" };
          }
        }
        return { message: ctx.defaultError };
      };

      const schema = z.string({ errorMap: customErrorMap });
      const result = schema.safeParse(123);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "文字列を入力してください"
        );
      }
    });
  });
});
