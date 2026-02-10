import { z } from "zod";

describe("配列とタプルのスキーマ", () => {
  describe("z.array()", () => {
    it("基本的な配列バリデーション", () => {
      const schema = z.array(z.string());
      expect(schema.parse(["a", "b", "c"])).toEqual(["a", "b", "c"]);
      expect(() => schema.parse(["a", 1, "c"])).toThrow();
      expect(() => schema.parse("not array")).toThrow();
    });

    it("min / max / length で長さを制約する", () => {
      const schema = z.array(z.number()).min(2).max(5);
      expect(schema.parse([1, 2, 3])).toEqual([1, 2, 3]);
      expect(() => schema.parse([1])).toThrow();
      expect(() => schema.parse([1, 2, 3, 4, 5, 6])).toThrow();

      const exact = z.array(z.number()).length(3);
      expect(exact.parse([1, 2, 3])).toEqual([1, 2, 3]);
      expect(() => exact.parse([1, 2])).toThrow();
    });

    it("nonempty で空配列を禁止する", () => {
      const schema = z.array(z.string()).nonempty();
      expect(schema.parse(["hello"])).toEqual(["hello"]);
      expect(() => schema.parse([])).toThrow();
    });

    it("ネストされた配列", () => {
      const matrix = z.array(z.array(z.number()));
      expect(
        matrix.parse([
          [1, 2],
          [3, 4],
        ])
      ).toEqual([
        [1, 2],
        [3, 4],
      ]);
    });

    it("オブジェクトの配列", () => {
      const schema = z.array(
        z.object({
          id: z.number(),
          name: z.string(),
        })
      );
      const data = [
        { id: 1, name: "太郎" },
        { id: 2, name: "花子" },
      ];
      expect(schema.parse(data)).toEqual(data);
    });
  });

  describe("z.tuple()", () => {
    it("固定長・固定型のタプルをバリデーションする", () => {
      const schema = z.tuple([z.string(), z.number(), z.boolean()]);
      expect(schema.parse(["hello", 42, true])).toEqual(["hello", 42, true]);
      expect(() => schema.parse(["hello", "42", true])).toThrow();
      expect(() => schema.parse(["hello", 42])).toThrow();
    });

    it("rest で可変長の末尾要素を定義できる", () => {
      const schema = z.tuple([z.string(), z.number()]).rest(z.boolean());
      expect(schema.parse(["hello", 42])).toEqual(["hello", 42]);
      expect(schema.parse(["hello", 42, true, false])).toEqual([
        "hello",
        42,
        true,
        false,
      ]);
      expect(() => schema.parse(["hello", 42, "not boolean"])).toThrow();
    });
  });

  describe("z.set()", () => {
    it("Setをバリデーションする", () => {
      const schema = z.set(z.number());
      const input = new Set([1, 2, 3]);
      const result = schema.parse(input);
      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(3);
      expect(result.has(1)).toBe(true);
    });

    it("min / max でサイズを制約する", () => {
      const schema = z.set(z.string()).min(1).max(3);
      expect(schema.parse(new Set(["a"]))).toBeInstanceOf(Set);
      expect(() => schema.parse(new Set())).toThrow();
      expect(() =>
        schema.parse(new Set(["a", "b", "c", "d"]))
      ).toThrow();
    });
  });

  describe("z.map()", () => {
    it("Mapをバリデーションする", () => {
      const schema = z.map(z.string(), z.number());
      const input = new Map([
        ["a", 1],
        ["b", 2],
      ]);
      const result = schema.parse(input);
      expect(result).toBeInstanceOf(Map);
      expect(result.get("a")).toBe(1);
    });
  });

  describe("z.record()", () => {
    it("レコード型（動的キーのオブジェクト）をバリデーションする", () => {
      const schema = z.record(z.string(), z.number());
      expect(schema.parse({ apple: 100, banana: 200 })).toEqual({
        apple: 100,
        banana: 200,
      });
      expect(() => schema.parse({ apple: "not number" })).toThrow();
    });

    it("キーの型もバリデーションできる", () => {
      const schema = z.record(
        z.string().regex(/^item_/),
        z.number()
      );
      expect(schema.parse({ item_1: 100, item_2: 200 })).toEqual({
        item_1: 100,
        item_2: 200,
      });
      expect(() => schema.parse({ bad_key: 100 })).toThrow();
    });
  });
});
