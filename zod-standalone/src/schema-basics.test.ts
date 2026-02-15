import { z, ZodError } from "zod";

describe("スキーマ定義と基本バリデーション", () => {
  describe("プリミティブ型", () => {
    test("z.string() は文字列を受け付ける", () => {
      const schema = z.string();
      expect(schema.parse("hello")).toBe("hello");
    });

    test("z.string() は数値を拒否する", () => {
      const schema = z.string();
      expect(() => schema.parse(123)).toThrow(ZodError);
    });

    test("z.number() は数値を受け付ける", () => {
      const schema = z.number();
      expect(schema.parse(42)).toBe(42);
    });

    test("z.number() は文字列を拒否する", () => {
      const schema = z.number();
      expect(() => schema.parse("42")).toThrow(ZodError);
    });

    test("z.boolean() は真偽値を受け付ける", () => {
      const schema = z.boolean();
      expect(schema.parse(true)).toBe(true);
      expect(schema.parse(false)).toBe(false);
    });

    test("z.boolean() は文字列を拒否する", () => {
      const schema = z.boolean();
      expect(() => schema.parse("true")).toThrow(ZodError);
    });
  });

  describe("z.object() でオブジェクトスキーマを定義する", () => {
    const UserSchema = z.object({
      name: z.string(),
      age: z.number(),
      isActive: z.boolean(),
    });

    test("正しいオブジェクトはパースできる", () => {
      const result = UserSchema.parse({
        name: "太郎",
        age: 30,
        isActive: true,
      });
      expect(result).toEqual({ name: "太郎", age: 30, isActive: true });
    });

    test("フィールドの型が違うと拒否される", () => {
      expect(() =>
        UserSchema.parse({ name: 123, age: "thirty", isActive: "yes" })
      ).toThrow(ZodError);
    });

    test("未知のキーはデフォルトで除去される（strip）", () => {
      const result = UserSchema.parse({
        name: "太郎",
        age: 30,
        isActive: true,
        extra: "ignored",
      });
      expect(result).toEqual({ name: "太郎", age: 30, isActive: true });
      expect((result as Record<string, unknown>).extra).toBeUndefined();
    });
  });

  describe("parse() と safeParse() の違い", () => {
    const schema = z.string();

    test("parse() は成功時に値を返す", () => {
      expect(schema.parse("hello")).toBe("hello");
    });

    test("parse() は失敗時にZodErrorをthrowする", () => {
      expect(() => schema.parse(123)).toThrow(ZodError);
    });

    test("safeParse() は成功時に { success: true, data } を返す", () => {
      const result = schema.safeParse("hello");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("hello");
      }
    });

    test("safeParse() は失敗時に { success: false, error } を返す", () => {
      const result = schema.safeParse(123);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ZodError);
      }
    });

    test("safeParse() はthrowしないので try/catch 不要", () => {
      // parse() と違い、例外が飛ばないことを確認
      const result = schema.safeParse(123);
      expect(result.success).toBe(false);
    });
  });

  describe("z.infer で型を推論する", () => {
    const ProductSchema = z.object({
      id: z.number(),
      name: z.string(),
      price: z.number(),
      inStock: z.boolean(),
    });

    // z.infer<typeof ProductSchema> → { id: number; name: string; price: number; inStock: boolean }
    type Product = z.infer<typeof ProductSchema>;

    test("推論された型と一致するオブジェクトはパースできる", () => {
      const product: Product = {
        id: 1,
        name: "TypeScript本",
        price: 3000,
        inStock: true,
      };
      expect(ProductSchema.parse(product)).toEqual(product);
    });
  });
});
