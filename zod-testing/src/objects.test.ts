import { z } from "zod";

describe("オブジェクトスキーマ", () => {
  describe("基本的なオブジェクト定義", () => {
    const UserSchema = z.object({
      name: z.string(),
      age: z.number(),
      email: z.string().email(),
    });

    it("正しいオブジェクトを受け入れる", () => {
      const user = UserSchema.parse({
        name: "太郎",
        age: 25,
        email: "taro@example.com",
      });
      expect(user).toEqual({
        name: "太郎",
        age: 25,
        email: "taro@example.com",
      });
    });

    it("プロパティが不足していると拒否する", () => {
      expect(() => UserSchema.parse({ name: "太郎" })).toThrow();
    });

    it("余分なプロパティはデフォルトで除去される (strip)", () => {
      const result = UserSchema.parse({
        name: "太郎",
        age: 25,
        email: "taro@example.com",
        extra: "余分なデータ",
      });
      expect(result).toEqual({
        name: "太郎",
        age: 25,
        email: "taro@example.com",
      });
      expect(result).not.toHaveProperty("extra");
    });
  });

  describe("strict / passthrough / strip", () => {
    const Base = z.object({ name: z.string() });

    it("strict: 余分なプロパティがあるとエラーになる", () => {
      const strict = Base.strict();
      expect(strict.parse({ name: "太郎" })).toEqual({ name: "太郎" });
      expect(() =>
        strict.parse({ name: "太郎", extra: "余分" })
      ).toThrow();
    });

    it("passthrough: 余分なプロパティをそのまま通す", () => {
      const passthrough = Base.passthrough();
      const result = passthrough.parse({ name: "太郎", extra: "余分" });
      expect(result).toEqual({ name: "太郎", extra: "余分" });
    });

    it("strip: 余分なプロパティを除去する（デフォルト動作）", () => {
      const stripped = Base.strip();
      const result = stripped.parse({ name: "太郎", extra: "余分" });
      expect(result).toEqual({ name: "太郎" });
    });
  });

  describe("optional / nullable / nullish", () => {
    it("optionalでプロパティを省略可能にする", () => {
      const schema = z.object({
        name: z.string(),
        nickname: z.string().optional(),
      });
      expect(schema.parse({ name: "太郎" })).toEqual({ name: "太郎" });
      expect(schema.parse({ name: "太郎", nickname: "たろちゃん" })).toEqual({
        name: "太郎",
        nickname: "たろちゃん",
      });
    });

    it("nullableでnullを許容する", () => {
      const schema = z.object({
        name: z.string(),
        bio: z.string().nullable(),
      });
      expect(schema.parse({ name: "太郎", bio: null })).toEqual({
        name: "太郎",
        bio: null,
      });
      // undefinedは拒否される
      expect(() => schema.parse({ name: "太郎" })).toThrow();
    });

    it("nullishでnullとundefinedの両方を許容する", () => {
      const schema = z.object({
        name: z.string(),
        bio: z.string().nullish(),
      });
      expect(schema.parse({ name: "太郎", bio: null })).toEqual({
        name: "太郎",
        bio: null,
      });
      expect(schema.parse({ name: "太郎" })).toEqual({ name: "太郎" });
    });
  });

  describe("default", () => {
    it("値がundefinedの場合デフォルト値を使う", () => {
      const schema = z.object({
        name: z.string(),
        role: z.string().default("user"),
      });
      expect(schema.parse({ name: "太郎" })).toEqual({
        name: "太郎",
        role: "user",
      });
      expect(schema.parse({ name: "太郎", role: "admin" })).toEqual({
        name: "太郎",
        role: "admin",
      });
    });

    it("関数でデフォルト値を動的に生成できる", () => {
      const schema = z.object({
        createdAt: z.date().default(() => new Date("2024-01-01")),
      });
      const result = schema.parse({});
      expect(result.createdAt).toEqual(new Date("2024-01-01"));
    });
  });

  describe("partial / required / deepPartial", () => {
    const UserSchema = z.object({
      name: z.string(),
      age: z.number(),
      email: z.string().email(),
    });

    it("partialで全プロパティをoptionalにする", () => {
      const PartialUser = UserSchema.partial();
      expect(PartialUser.parse({})).toEqual({});
      expect(PartialUser.parse({ name: "太郎" })).toEqual({ name: "太郎" });
    });

    it("partial({...})で特定プロパティのみoptionalにする", () => {
      const schema = UserSchema.partial({ age: true, email: true });
      expect(schema.parse({ name: "太郎" })).toEqual({ name: "太郎" });
      expect(() => schema.parse({})).toThrow(); // nameは必須
    });

    it("requiredでpartialを元に戻す", () => {
      const PartialUser = UserSchema.partial();
      const RequiredUser = PartialUser.required();
      expect(() => RequiredUser.parse({})).toThrow();
      expect(
        RequiredUser.parse({
          name: "太郎",
          age: 25,
          email: "taro@example.com",
        })
      ).toEqual({ name: "太郎", age: 25, email: "taro@example.com" });
    });
  });

  describe("pick / omit", () => {
    const UserSchema = z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email(),
      password: z.string(),
    });

    it("pickで指定プロパティのみ含むスキーマを作成する", () => {
      const PublicUser = UserSchema.pick({ id: true, name: true });
      expect(PublicUser.parse({ id: 1, name: "太郎" })).toEqual({
        id: 1,
        name: "太郎",
      });
      // emailやpasswordは不要
      expect(
        PublicUser.parse({ id: 1, name: "太郎", email: "a@b.com" })
      ).toEqual({ id: 1, name: "太郎" });
    });

    it("omitで指定プロパティを除外したスキーマを作成する", () => {
      const UserWithoutPassword = UserSchema.omit({ password: true });
      expect(
        UserWithoutPassword.parse({
          id: 1,
          name: "太郎",
          email: "taro@example.com",
        })
      ).toEqual({ id: 1, name: "太郎", email: "taro@example.com" });
    });
  });

  describe("extend / merge", () => {
    const BaseSchema = z.object({
      id: z.number(),
      name: z.string(),
    });

    it("extendでプロパティを追加する", () => {
      const ExtendedSchema = BaseSchema.extend({
        email: z.string().email(),
      });
      expect(
        ExtendedSchema.parse({
          id: 1,
          name: "太郎",
          email: "taro@example.com",
        })
      ).toEqual({ id: 1, name: "太郎", email: "taro@example.com" });
    });

    it("extendで既存プロパティを上書きできる", () => {
      const Overridden = BaseSchema.extend({
        name: z.number(), // stringからnumberに変更
      });
      expect(Overridden.parse({ id: 1, name: 42 })).toEqual({
        id: 1,
        name: 42,
      });
      expect(() => Overridden.parse({ id: 1, name: "太郎" })).toThrow();
    });

    it("mergeで2つのスキーマを統合する", () => {
      const AddressSchema = z.object({
        city: z.string(),
        zip: z.string(),
      });
      const Merged = BaseSchema.merge(AddressSchema);
      expect(
        Merged.parse({ id: 1, name: "太郎", city: "東京", zip: "100-0001" })
      ).toEqual({ id: 1, name: "太郎", city: "東京", zip: "100-0001" });
    });
  });

  describe("keyof / shape", () => {
    const UserSchema = z.object({
      id: z.number(),
      name: z.string(),
      email: z.string(),
    });

    it("keyofでキーのenumスキーマを取得する", () => {
      const KeyEnum = UserSchema.keyof();
      expect(KeyEnum.parse("id")).toBe("id");
      expect(KeyEnum.parse("name")).toBe("name");
      expect(() => KeyEnum.parse("unknown")).toThrow();
    });

    it("shapeでプロパティスキーマに直接アクセスできる", () => {
      expect(UserSchema.shape.name.parse("太郎")).toBe("太郎");
      expect(() => UserSchema.shape.name.parse(123)).toThrow();
    });
  });

  describe("ネストされたオブジェクト", () => {
    it("ネストしたオブジェクトを正しくバリデーションする", () => {
      const AddressSchema = z.object({
        city: z.string(),
        zip: z.string(),
      });

      const UserSchema = z.object({
        name: z.string(),
        address: AddressSchema,
      });

      const result = UserSchema.parse({
        name: "太郎",
        address: { city: "東京", zip: "100-0001" },
      });
      expect(result.address.city).toBe("東京");
    });
  });
});
