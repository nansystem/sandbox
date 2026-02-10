import { z } from "zod";

describe("transform と refine", () => {
  describe("transform", () => {
    it("パース後に値を変換する", () => {
      const schema = z.string().transform((val) => val.length);
      expect(schema.parse("hello")).toBe(5);
    });

    it("文字列を数値に変換する", () => {
      const schema = z.string().transform((val) => Number(val));
      expect(schema.parse("42")).toBe(42);
    });

    it("オブジェクト内でtransformを使う", () => {
      const schema = z.object({
        name: z.string().transform((val) => val.toUpperCase()),
        score: z
          .string()
          .transform((val) => parseInt(val, 10))
          .pipe(z.number().min(0).max(100)),
      });

      expect(schema.parse({ name: "taro", score: "85" })).toEqual({
        name: "TARO",
        score: 85,
      });
    });

    it("チェインで複数の変換を適用する", () => {
      const schema = z
        .string()
        .transform((val) => val.trim())
        .transform((val) => val.toLowerCase())
        .transform((val) => val.split(" "));

      expect(schema.parse("  Hello World  ")).toEqual(["hello", "world"]);
    });
  });

  describe("refine", () => {
    it("カスタムバリデーションを追加する", () => {
      const schema = z.string().refine((val) => val.includes("@"), {
        message: "@を含む必要があります",
      });
      expect(schema.parse("user@example.com")).toBe("user@example.com");
      expect(() => schema.parse("invalid")).toThrow();
    });

    it("非同期バリデーション", async () => {
      const schema = z.string().refine(
        async (val) => {
          // 非同期チェックのシミュレーション
          return val !== "taken";
        },
        { message: "この値は既に使われています" }
      );

      const result = await schema.parseAsync("available");
      expect(result).toBe("available");

      await expect(schema.parseAsync("taken")).rejects.toThrow();
    });

    it("refineでオブジェクト全体をバリデーションする", () => {
      const PasswordSchema = z
        .object({
          password: z.string().min(8),
          confirm: z.string(),
        })
        .refine((data) => data.password === data.confirm, {
          message: "パスワードが一致しません",
          path: ["confirm"],
        });

      expect(
        PasswordSchema.parse({ password: "12345678", confirm: "12345678" })
      ).toEqual({ password: "12345678", confirm: "12345678" });

      expect(() =>
        PasswordSchema.parse({ password: "12345678", confirm: "different" })
      ).toThrow();
    });
  });

  describe("superRefine", () => {
    it("複数のエラーを同時に報告できる", () => {
      const schema = z.string().superRefine((val, ctx) => {
        if (val.length < 8) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "8文字以上必要です",
          });
        }
        if (!/[A-Z]/.test(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "大文字を1つ以上含む必要があります",
          });
        }
        if (!/[0-9]/.test(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "数字を1つ以上含む必要があります",
          });
        }
      });

      expect(schema.parse("Password1")).toBe("Password1");

      // 複数のエラーが同時に報告される
      const result = schema.safeParse("abc");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBe(3);
      }
    });
  });

  describe("pipe", () => {
    it("スキーマのチェインでバリデーションと変換を組み合わせる", () => {
      const schema = z
        .string()
        .transform((val) => Number(val))
        .pipe(z.number().int().positive());

      expect(schema.parse("42")).toBe(42);
      expect(() => schema.parse("3.14")).toThrow(); // intでない
      expect(() => schema.parse("-5")).toThrow(); // positiveでない
      expect(() => schema.parse("abc")).toThrow(); // NaN
    });
  });

  describe("preprocess", () => {
    it("バリデーション前にデータを前処理する", () => {
      const schema = z.preprocess((val) => {
        if (typeof val === "string") return Number(val);
        return val;
      }, z.number().int().positive());

      expect(schema.parse("42")).toBe(42);
      expect(schema.parse(42)).toBe(42);
      expect(() => schema.parse("abc")).toThrow();
    });
  });

  describe("catch", () => {
    it("バリデーションエラー時にデフォルト値を返す", () => {
      const schema = z.string().catch("デフォルト");
      expect(schema.parse("hello")).toBe("hello");
      expect(schema.parse(42)).toBe("デフォルト");
    });

    it("オブジェクトのフィールドにcatchを使う", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().catch(0),
      });
      expect(schema.parse({ name: "太郎", age: "invalid" })).toEqual({
        name: "太郎",
        age: 0,
      });
    });
  });

  describe("brand", () => {
    it("ブランド型を作って型安全性を高める", () => {
      const UserId = z.string().uuid().brand<"UserId">();
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const userId = UserId.parse(uuid);
      expect(userId).toBe(uuid);
      expect(() => UserId.parse("not-a-uuid")).toThrow();
    });
  });
});
