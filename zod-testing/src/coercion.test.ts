import { z } from "zod";

describe("型強制 (coercion)", () => {
  describe("z.coerce.string()", () => {
    it("さまざまな値を文字列に変換する", () => {
      expect(z.coerce.string().parse(123)).toBe("123");
      expect(z.coerce.string().parse(true)).toBe("true");
      expect(z.coerce.string().parse(null)).toBe("null");
      expect(z.coerce.string().parse(undefined)).toBe("undefined");
    });
  });

  describe("z.coerce.number()", () => {
    it("文字列を数値に変換する", () => {
      expect(z.coerce.number().parse("42")).toBe(42);
      expect(z.coerce.number().parse("3.14")).toBe(3.14);
    });

    it("真偽値を数値に変換する", () => {
      expect(z.coerce.number().parse(true)).toBe(1);
      expect(z.coerce.number().parse(false)).toBe(0);
    });

    it("変換後のバリデーションも適用できる", () => {
      const schema = z.coerce.number().int().positive();
      expect(schema.parse("42")).toBe(42);
      expect(() => schema.parse("3.14")).toThrow();
      expect(() => schema.parse("-5")).toThrow();
    });

    it("数値に変換できない文字列はNaNとして拒否される", () => {
      // Zod v3では NaN は invalid_type として拒否される
      expect(() => z.coerce.number().parse("abc")).toThrow();

      // safeParse でエラー内容を確認
      const result = z.coerce.number().safeParse("abc");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe("invalid_type");
        expect(result.error.issues[0].received).toBe("nan");
      }
    });
  });

  describe("z.coerce.boolean()", () => {
    it("truthy/falsy値を真偽値に変換する", () => {
      expect(z.coerce.boolean().parse("true")).toBe(true);
      expect(z.coerce.boolean().parse(1)).toBe(true);
      expect(z.coerce.boolean().parse("hello")).toBe(true);
      expect(z.coerce.boolean().parse(0)).toBe(false);
      expect(z.coerce.boolean().parse("")).toBe(false);
      expect(z.coerce.boolean().parse(null)).toBe(false);
      expect(z.coerce.boolean().parse(undefined)).toBe(false);
    });
  });

  describe("z.coerce.date()", () => {
    it("文字列をDateに変換する", () => {
      const result = z.coerce.date().parse("2024-01-15");
      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toContain("2024-01-15");
    });

    it("数値(タイムスタンプ)をDateに変換する", () => {
      const timestamp = new Date("2024-01-15").getTime();
      const result = z.coerce.date().parse(timestamp);
      expect(result).toBeInstanceOf(Date);
    });

    it("無効な日付文字列を拒否する", () => {
      expect(() => z.coerce.date().parse("not-a-date")).toThrow();
    });

    it("変換後にmin/maxバリデーションを適用できる", () => {
      const schema = z.coerce
        .date()
        .min(new Date("2024-01-01"))
        .max(new Date("2024-12-31"));

      expect(schema.parse("2024-06-15")).toBeInstanceOf(Date);
      expect(() => schema.parse("2023-06-15")).toThrow();
    });
  });

  describe("z.coerce.bigint()", () => {
    it("文字列をBigIntに変換する", () => {
      expect(z.coerce.bigint().parse("123")).toBe(123n);
    });

    it("数値をBigIntに変換する", () => {
      expect(z.coerce.bigint().parse(123)).toBe(123n);
    });
  });
});
