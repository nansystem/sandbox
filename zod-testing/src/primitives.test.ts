import { z } from "zod";

describe("プリミティブ型のバリデーション", () => {
  describe("z.string()", () => {
    const schema = z.string();

    it("文字列を受け入れる", () => {
      expect(schema.parse("hello")).toBe("hello");
    });

    it("数値を拒否する", () => {
      expect(() => schema.parse(123)).toThrow();
    });

    it("組み込みバリデーション: min / max / length", () => {
      const bounded = z.string().min(2).max(5);
      expect(bounded.parse("abc")).toBe("abc");
      expect(() => bounded.parse("a")).toThrow();
      expect(() => bounded.parse("abcdef")).toThrow();

      const exact = z.string().length(3);
      expect(exact.parse("abc")).toBe("abc");
      expect(() => exact.parse("ab")).toThrow();
    });

    it("email / url / uuid バリデーション", () => {
      expect(z.string().email().parse("user@example.com")).toBe(
        "user@example.com"
      );
      expect(() => z.string().email().parse("not-email")).toThrow();

      expect(z.string().url().parse("https://example.com")).toBe(
        "https://example.com"
      );
      expect(() => z.string().url().parse("not-url")).toThrow();

      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      expect(z.string().uuid().parse(uuid)).toBe(uuid);
      expect(() => z.string().uuid().parse("not-uuid")).toThrow();
    });

    it("regex バリデーション", () => {
      const hex = z.string().regex(/^#[0-9a-f]{6}$/i);
      expect(hex.parse("#ff00aa")).toBe("#ff00aa");
      expect(() => hex.parse("ff00aa")).toThrow();
    });

    it("trim / toLowerCase / toUpperCase による変換", () => {
      expect(z.string().trim().parse("  hello  ")).toBe("hello");
      expect(z.string().toLowerCase().parse("HELLO")).toBe("hello");
      expect(z.string().toUpperCase().parse("hello")).toBe("HELLO");
    });

    it("includes / startsWith / endsWith", () => {
      expect(z.string().includes("world").parse("hello world")).toBe(
        "hello world"
      );
      expect(() => z.string().includes("world").parse("hello")).toThrow();

      expect(z.string().startsWith("hello").parse("hello world")).toBe(
        "hello world"
      );
      expect(z.string().endsWith("world").parse("hello world")).toBe(
        "hello world"
      );
    });

    it("datetime バリデーション", () => {
      const dt = z.string().datetime();
      expect(dt.parse("2024-01-15T10:30:00Z")).toBe("2024-01-15T10:30:00Z");
      expect(() => dt.parse("2024-01-15")).toThrow();
    });
  });

  describe("z.number()", () => {
    const schema = z.number();

    it("数値を受け入れる", () => {
      expect(schema.parse(42)).toBe(42);
      expect(schema.parse(3.14)).toBe(3.14);
    });

    it("文字列を拒否する", () => {
      expect(() => schema.parse("42")).toThrow();
    });

    it("int / positive / negative / nonnegative / nonpositive", () => {
      expect(z.number().int().parse(5)).toBe(5);
      expect(() => z.number().int().parse(3.14)).toThrow();

      expect(z.number().positive().parse(1)).toBe(1);
      expect(() => z.number().positive().parse(0)).toThrow();

      expect(z.number().negative().parse(-1)).toBe(-1);
      expect(() => z.number().negative().parse(0)).toThrow();

      expect(z.number().nonnegative().parse(0)).toBe(0);
      expect(z.number().nonpositive().parse(0)).toBe(0);
    });

    it("min / max / gt / lt / gte / lte", () => {
      expect(z.number().min(5).max(10).parse(7)).toBe(7);
      expect(() => z.number().min(5).parse(4)).toThrow();
      expect(() => z.number().max(10).parse(11)).toThrow();

      expect(z.number().gt(5).parse(6)).toBe(6);
      expect(() => z.number().gt(5).parse(5)).toThrow();

      expect(z.number().gte(5).parse(5)).toBe(5);
      expect(z.number().lt(10).parse(9)).toBe(9);
      expect(z.number().lte(10).parse(10)).toBe(10);
    });

    it("multipleOf", () => {
      expect(z.number().multipleOf(3).parse(9)).toBe(9);
      expect(() => z.number().multipleOf(3).parse(10)).toThrow();
    });

    it("finite", () => {
      expect(z.number().finite().parse(100)).toBe(100);
      expect(() => z.number().finite().parse(Infinity)).toThrow();
    });
  });

  describe("z.boolean()", () => {
    const schema = z.boolean();

    it("真偽値を受け入れる", () => {
      expect(schema.parse(true)).toBe(true);
      expect(schema.parse(false)).toBe(false);
    });

    it("文字列を拒否する", () => {
      expect(() => schema.parse("true")).toThrow();
    });
  });

  describe("z.date()", () => {
    const schema = z.date();

    it("Dateオブジェクトを受け入れる", () => {
      const now = new Date();
      expect(schema.parse(now)).toEqual(now);
    });

    it("文字列を拒否する", () => {
      expect(() => schema.parse("2024-01-15")).toThrow();
    });

    it("min / max で範囲を指定できる", () => {
      const minDate = new Date("2024-01-01");
      const maxDate = new Date("2024-12-31");
      const bounded = z.date().min(minDate).max(maxDate);

      expect(bounded.parse(new Date("2024-06-15"))).toEqual(
        new Date("2024-06-15")
      );
      expect(() => bounded.parse(new Date("2023-06-15"))).toThrow();
      expect(() => bounded.parse(new Date("2025-06-15"))).toThrow();
    });
  });

  describe("z.bigint()", () => {
    it("BigIntを受け入れる", () => {
      expect(z.bigint().parse(100n)).toBe(100n);
    });

    it("数値を拒否する", () => {
      expect(() => z.bigint().parse(100)).toThrow();
    });
  });

  describe("z.undefined() / z.null() / z.void()", () => {
    it("undefinedのみ受け入れる", () => {
      expect(z.undefined().parse(undefined)).toBeUndefined();
      expect(() => z.undefined().parse(null)).toThrow();
    });

    it("nullのみ受け入れる", () => {
      expect(z.null().parse(null)).toBeNull();
      expect(() => z.null().parse(undefined)).toThrow();
    });

    it("voidはundefinedを受け入れる", () => {
      expect(z.void().parse(undefined)).toBeUndefined();
    });
  });

  describe("z.literal()", () => {
    it("指定したリテラル値のみ受け入れる", () => {
      const tuna = z.literal("tuna");
      expect(tuna.parse("tuna")).toBe("tuna");
      expect(() => tuna.parse("salmon")).toThrow();

      const fortyTwo = z.literal(42);
      expect(fortyTwo.parse(42)).toBe(42);
      expect(() => fortyTwo.parse(43)).toThrow();

      const truthy = z.literal(true);
      expect(truthy.parse(true)).toBe(true);
      expect(() => truthy.parse(false)).toThrow();
    });
  });

  describe("z.enum()", () => {
    const FruitEnum = z.enum(["apple", "banana", "orange"]);

    it("定義した値を受け入れる", () => {
      expect(FruitEnum.parse("apple")).toBe("apple");
      expect(FruitEnum.parse("banana")).toBe("banana");
    });

    it("定義外の値を拒否する", () => {
      expect(() => FruitEnum.parse("grape")).toThrow();
    });

    it("enumの値一覧を取得できる", () => {
      expect(FruitEnum.options).toEqual(["apple", "banana", "orange"]);
    });

    it("Enumオブジェクトからも値を参照できる", () => {
      expect(FruitEnum.enum.apple).toBe("apple");
      expect(FruitEnum.enum.banana).toBe("banana");
    });
  });

  describe("z.nativeEnum()", () => {
    enum Direction {
      Up = "UP",
      Down = "DOWN",
      Left = "LEFT",
      Right = "RIGHT",
    }

    const schema = z.nativeEnum(Direction);

    it("TypeScriptのenumの値を受け入れる", () => {
      expect(schema.parse("UP")).toBe(Direction.Up);
      expect(schema.parse(Direction.Down)).toBe("DOWN");
    });

    it("enumに含まれない値を拒否する", () => {
      expect(() => schema.parse("DIAGONAL")).toThrow();
    });
  });

  describe("z.any() / z.unknown()", () => {
    it("anyはどんな値も受け入れる", () => {
      expect(z.any().parse("hello")).toBe("hello");
      expect(z.any().parse(123)).toBe(123);
      expect(z.any().parse(null)).toBeNull();
    });

    it("unknownもどんな値も受け入れる", () => {
      expect(z.unknown().parse("hello")).toBe("hello");
      expect(z.unknown().parse(123)).toBe(123);
    });
  });

  describe("z.never()", () => {
    it("どんな値も拒否する", () => {
      expect(() => z.never().parse("hello")).toThrow();
      expect(() => z.never().parse(undefined)).toThrow();
    });
  });
});
