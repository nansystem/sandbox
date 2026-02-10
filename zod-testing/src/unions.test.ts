import { z } from "zod";

describe("ユニオン・インターセクション・判別ユニオン", () => {
  describe("z.union()", () => {
    it("いずれかのスキーマに合致すれば通る", () => {
      const schema = z.union([z.string(), z.number()]);
      expect(schema.parse("hello")).toBe("hello");
      expect(schema.parse(42)).toBe(42);
      expect(() => schema.parse(true)).toThrow();
    });

    it("or() でもユニオンを作れる", () => {
      const schema = z.string().or(z.number());
      expect(schema.parse("hello")).toBe("hello");
      expect(schema.parse(42)).toBe(42);
      expect(() => schema.parse(true)).toThrow();
    });
  });

  describe("z.discriminatedUnion()", () => {
    const EventSchema = z.discriminatedUnion("type", [
      z.object({
        type: z.literal("click"),
        x: z.number(),
        y: z.number(),
      }),
      z.object({
        type: z.literal("keypress"),
        key: z.string(),
      }),
      z.object({
        type: z.literal("scroll"),
        offset: z.number(),
      }),
    ]);

    it("判別キーに基づいて正しいスキーマを選択する", () => {
      expect(EventSchema.parse({ type: "click", x: 10, y: 20 })).toEqual({
        type: "click",
        x: 10,
        y: 20,
      });
      expect(EventSchema.parse({ type: "keypress", key: "Enter" })).toEqual({
        type: "keypress",
        key: "Enter",
      });
    });

    it("判別キーに合致しないデータを拒否する", () => {
      expect(() =>
        EventSchema.parse({ type: "click", key: "Enter" })
      ).toThrow();
    });

    it("未定義のtype値を拒否する", () => {
      expect(() =>
        EventSchema.parse({ type: "hover", x: 10, y: 20 })
      ).toThrow();
    });
  });

  describe("z.intersection()", () => {
    it("2つのスキーマの共通部分を満たす値を受け入れる", () => {
      const A = z.object({ name: z.string() });
      const B = z.object({ age: z.number() });
      const schema = z.intersection(A, B);

      expect(schema.parse({ name: "太郎", age: 25 })).toEqual({
        name: "太郎",
        age: 25,
      });
      expect(() => schema.parse({ name: "太郎" })).toThrow();
    });

    it("and() でもインターセクションを作れる", () => {
      const schema = z
        .object({ name: z.string() })
        .and(z.object({ age: z.number() }));

      expect(schema.parse({ name: "太郎", age: 25 })).toEqual({
        name: "太郎",
        age: 25,
      });
    });
  });
});
