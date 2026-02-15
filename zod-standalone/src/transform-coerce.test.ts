import { z } from "zod";

describe("変換とcoerce", () => {
  describe("z.coerce — FormDataの文字列を適切な型に変換", () => {
    test("z.coerce.number() は文字列を数値に変換する", () => {
      const schema = z.coerce.number();
      // FormData から取得した値は全て文字列
      expect(schema.parse("42")).toBe(42);
      expect(schema.parse("3.14")).toBe(3.14);
      expect(schema.parse("0")).toBe(0);
    });

    test("z.coerce.number() は数値に変換できない文字列を拒否する（v4ではNaNはinvalid_type）", () => {
      const schema = z.coerce.number();
      // v4ではNaN変換結果をinvalid_typeとして拒否する
      const result = schema.safeParse("abc");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe("invalid_type");
      }
    });

    test("z.coerce.number() にバリデーションをチェインできる", () => {
      const schema = z.coerce.number().int().min(1).max(100);
      expect(schema.parse("42")).toBe(42);
      expect(schema.safeParse("0").success).toBe(false);
      expect(schema.safeParse("3.14").success).toBe(false);
    });

    test("z.coerce.boolean() は文字列を真偽値に変換する", () => {
      const schema = z.coerce.boolean();
      // truthy な値は true になる
      expect(schema.parse("true")).toBe(true);
      expect(schema.parse("1")).toBe(true);
      expect(schema.parse("on")).toBe(true);
      expect(schema.parse("anything")).toBe(true);
      // falsy な値は false になる
      expect(schema.parse("")).toBe(false);
      expect(schema.parse(0)).toBe(false);
      expect(schema.parse(null)).toBe(false);
      expect(schema.parse(undefined)).toBe(false);
    });
  });

  describe("transform() — 出力型を変える", () => {
    test("文字列の長さに変換する", () => {
      const schema = z.string().transform((val) => val.length);
      expect(schema.parse("hello")).toBe(5);
      expect(schema.parse("")).toBe(0);
    });

    test("文字列を日付に変換する", () => {
      const schema = z.string().transform((val) => new Date(val));
      const result = schema.parse("2024-01-15");
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2024);
    });

    test("カンマ区切り文字列を配列に変換する", () => {
      const schema = z.string().transform((val) => val.split(","));
      expect(schema.parse("a,b,c")).toEqual(["a", "b", "c"]);
    });

    test("transform() の前にバリデーションできる", () => {
      const schema = z
        .string()
        .min(1, "空文字は不可")
        .transform((val) => val.toUpperCase());

      expect(schema.parse("hello")).toBe("HELLO");
      expect(schema.safeParse("").success).toBe(false);
    });
  });

  describe("z.input と z.output — 入力型と出力型の違い", () => {
    test("transformがないスキーマでは input と output は同じ", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });
      // z.input<typeof schema> と z.output<typeof schema> は同じ型
      type Input = z.input<typeof schema>;
      type Output = z.output<typeof schema>;

      // 型レベルのテストだが、実行時にも同じ値を返す
      const data = { name: "太郎", age: 30 };
      const result = schema.parse(data);
      expect(result).toEqual(data);
    });

    test("transformがあるスキーマでは input と output が異なる", () => {
      const schema = z.object({
        name: z.string(),
        nameLength: z.string().transform((val) => val.length),
      });

      // Input: { name: string; nameLength: string }
      // Output: { name: string; nameLength: number }
      type Input = z.input<typeof schema>;
      type Output = z.output<typeof schema>;

      const input: Input = { name: "太郎", nameLength: "hello" };
      const output: Output = schema.parse(input);

      expect(typeof input.nameLength).toBe("string");
      expect(typeof output.nameLength).toBe("number");
      expect(output.nameLength).toBe(5);
    });

    test("coerceでも input と output が異なる", () => {
      const schema = z.object({
        age: z.coerce.number(),
      });

      // FormData由来の文字列を渡してもnumberに変換される
      const result = schema.parse({ age: "25" });
      expect(result.age).toBe(25);
      expect(typeof result.age).toBe("number");
    });
  });

  describe("FormData → Zodパース の実践パターン", () => {
    test("FormDataの全string値をcoerceでバリデーション＆変換する", () => {
      // フォームから送信されたデータを模擬
      const formValues = {
        name: "太郎",
        email: "taro@example.com",
        age: "25",
        agreeToTerms: "on",
      };

      const FormSchema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
        age: z.coerce.number().int().min(0).max(150),
        agreeToTerms: z.coerce.boolean(),
      });

      const result = FormSchema.parse(formValues);
      expect(result).toEqual({
        name: "太郎",
        email: "taro@example.com",
        age: 25,
        agreeToTerms: true,
      });
    });
  });
});
