import { z } from "zod";

describe("カスタムエラーメッセージ", () => {
  describe("スキーマ定義時の error パラメータ", () => {
    test("z.string() にカスタムメッセージを設定する", () => {
      const schema = z.string({ error: "文字列を入力してください" });
      const result = schema.safeParse(123);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "文字列を入力してください"
        );
      }
    });

    test("z.number() にカスタムメッセージを設定する", () => {
      const schema = z.number({ error: "数値を入力してください" });
      const result = schema.safeParse("abc");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "数値を入力してください"
        );
      }
    });
  });

  describe("各バリデータの error パラメータ", () => {
    test("min() にカスタムメッセージを設定する", () => {
      const schema = z.string().min(3, { error: "3文字以上入力してください" });
      const result = schema.safeParse("ab");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "3文字以上入力してください"
        );
      }
    });

    test("文字列ショートハンドでもカスタムメッセージを設定できる", () => {
      const schema = z.string().min(3, "3文字以上入力してください");
      const result = schema.safeParse("ab");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "3文字以上入力してください"
        );
      }
    });

    test("max() にカスタムメッセージを設定する", () => {
      const schema = z.string().max(10, "10文字以内にしてください");
      const result = schema.safeParse("12345678901");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "10文字以内にしてください"
        );
      }
    });

    test("email() にカスタムメッセージを設定する", () => {
      const schema = z.string().email({ error: "正しいメールアドレスを入力してください" });
      const result = schema.safeParse("bad");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "正しいメールアドレスを入力してください"
        );
      }
    });
  });

  describe("日本語エラーメッセージのパターン", () => {
    test("フォーム向けスキーマに日本語メッセージをまとめて設定する", () => {
      const ContactSchema = z.object({
        name: z
          .string({ error: "名前は文字列で入力してください" })
          .min(1, "名前を入力してください")
          .max(50, "名前は50文字以内にしてください"),
        email: z
          .string({ error: "メールアドレスは文字列で入力してください" })
          .min(1, "メールアドレスを入力してください")
          .email({ error: "正しいメールアドレスを入力してください" }),
        age: z
          .number({ error: "年齢は数値で入力してください" })
          .int({ error: "年齢は整数で入力してください" })
          .min(0, "年齢は0以上にしてください")
          .max(150, "年齢は150以下にしてください"),
      });

      // 空文字を入力した場合
      const result1 = ContactSchema.safeParse({
        name: "",
        email: "",
        age: 25,
      });
      expect(result1.success).toBe(false);
      if (!result1.success) {
        const flat = z.flattenError(result1.error);
        expect(flat.fieldErrors.name).toContain("名前を入力してください");
        expect(flat.fieldErrors.email).toContain(
          "メールアドレスを入力してください"
        );
      }

      // 型が違う場合
      const result2 = ContactSchema.safeParse({
        name: 123,
        email: "user@example.com",
        age: 25,
      });
      expect(result2.success).toBe(false);
      if (!result2.success) {
        const flat = z.flattenError(result2.error);
        expect(flat.fieldErrors.name).toContain(
          "名前は文字列で入力してください"
        );
      }
    });
  });

  describe("error パラメータに関数を渡す", () => {
    test("issue の情報を使って動的にメッセージを生成する", () => {
      const schema = z.number({
        error: (iss) =>
          `数値を入力してください（受け取った値: ${JSON.stringify(iss.input)}）`,
      });
      const result = schema.safeParse("abc");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          '数値を入力してください（受け取った値: "abc"）'
        );
      }
    });
  });
});
