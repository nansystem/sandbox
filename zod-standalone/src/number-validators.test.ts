import { z } from "zod";

describe("数値の組み込みバリデータ", () => {
  describe("min / max", () => {
    test("min() で最小値を検証する", () => {
      const schema = z.number().min(0);
      expect(schema.safeParse(-1).success).toBe(false);
      expect(schema.safeParse(0).success).toBe(true);
      expect(schema.safeParse(1).success).toBe(true);
    });

    test("max() で最大値を検証する", () => {
      const schema = z.number().max(100);
      expect(schema.safeParse(100).success).toBe(true);
      expect(schema.safeParse(101).success).toBe(false);
    });

    test("min() と max() で範囲を指定する", () => {
      const age = z.number().min(0).max(150);
      expect(age.safeParse(-1).success).toBe(false);
      expect(age.safeParse(0).success).toBe(true);
      expect(age.safeParse(30).success).toBe(true);
      expect(age.safeParse(150).success).toBe(true);
      expect(age.safeParse(151).success).toBe(false);
    });
  });

  describe("int — 整数チェック", () => {
    test("z.number().int() は整数のみ受け付ける", () => {
      const schema = z.number().int();
      expect(schema.safeParse(5).success).toBe(true);
      expect(schema.safeParse(5.5).success).toBe(false);
      expect(schema.safeParse(-3).success).toBe(true);
    });

    test("z.int() でも整数スキーマを作れる（v4のスタンドアロン形式）", () => {
      const schema = z.int();
      expect(schema.safeParse(5).success).toBe(true);
      expect(schema.safeParse(5.5).success).toBe(false);
    });
  });

  describe("positive / nonnegative", () => {
    test("positive() は正の数のみ受け付ける（0は拒否）", () => {
      const schema = z.number().positive();
      expect(schema.safeParse(-1).success).toBe(false);
      expect(schema.safeParse(0).success).toBe(false);
      expect(schema.safeParse(1).success).toBe(true);
    });

    test("nonnegative() は0以上を受け付ける", () => {
      const schema = z.number().nonnegative();
      expect(schema.safeParse(-1).success).toBe(false);
      expect(schema.safeParse(0).success).toBe(true);
      expect(schema.safeParse(1).success).toBe(true);
    });
  });

  describe("フォームの入力でよく使うパターン", () => {
    test("年齢: 0〜150の整数", () => {
      const age = z.number().int().min(0).max(150);
      expect(age.safeParse(25).success).toBe(true);
      expect(age.safeParse(25.5).success).toBe(false);
      expect(age.safeParse(-1).success).toBe(false);
      expect(age.safeParse(200).success).toBe(false);
    });

    test("金額: 0以上の整数", () => {
      const price = z.number().int().nonnegative();
      expect(price.safeParse(0).success).toBe(true);
      expect(price.safeParse(1000).success).toBe(true);
      expect(price.safeParse(-100).success).toBe(false);
      expect(price.safeParse(99.99).success).toBe(false);
    });

    test("数量: 1以上の整数", () => {
      const quantity = z.number().int().positive();
      expect(quantity.safeParse(0).success).toBe(false);
      expect(quantity.safeParse(1).success).toBe(true);
      expect(quantity.safeParse(100).success).toBe(true);
    });

    test("割合: 0〜100の数値（小数OK）", () => {
      const percentage = z.number().min(0).max(100);
      expect(percentage.safeParse(0).success).toBe(true);
      expect(percentage.safeParse(50.5).success).toBe(true);
      expect(percentage.safeParse(100).success).toBe(true);
      expect(percentage.safeParse(100.1).success).toBe(false);
    });
  });
});
