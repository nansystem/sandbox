import { z } from "zod";

describe("複合スキーマ", () => {
  describe("optional / nullable / default", () => {
    test("optional() は undefined を許容する", () => {
      const schema = z.string().optional();
      expect(schema.parse("hello")).toBe("hello");
      expect(schema.parse(undefined)).toBeUndefined();
      // null は許容しない
      expect(schema.safeParse(null).success).toBe(false);
    });

    test("nullable() は null を許容する", () => {
      const schema = z.string().nullable();
      expect(schema.parse("hello")).toBe("hello");
      expect(schema.parse(null)).toBeNull();
      // undefined は許容しない
      expect(schema.safeParse(undefined).success).toBe(false);
    });

    test("default() は undefined の場合にデフォルト値を使う", () => {
      const schema = z.string().default("未設定");
      expect(schema.parse("hello")).toBe("hello");
      expect(schema.parse(undefined)).toBe("未設定");
    });

    test("optional() + default() を組み合わせる", () => {
      const schema = z.object({
        name: z.string(),
        role: z.string().default("user"),
      });
      const result = schema.parse({ name: "太郎" });
      expect(result).toEqual({ name: "太郎", role: "user" });
    });
  });

  describe("enum — 列挙型", () => {
    test("z.enum() で許可する値を列挙する", () => {
      const Status = z.enum(["active", "inactive", "pending"]);
      expect(Status.parse("active")).toBe("active");
      expect(Status.safeParse("deleted").success).toBe(false);
    });

    test("enum の値一覧を取得できる", () => {
      const Color = z.enum(["red", "green", "blue"]);
      expect(Color.options).toEqual(["red", "green", "blue"]);
    });

    test("enum から型を推論できる", () => {
      const Size = z.enum(["S", "M", "L", "XL"]);
      type Size = z.infer<typeof Size>; // "S" | "M" | "L" | "XL"
      const size: Size = "M";
      expect(Size.parse(size)).toBe("M");
    });
  });

  describe("union — 複数の型のいずれか", () => {
    test("z.union() でいずれかの型を受け付ける", () => {
      const schema = z.union([z.string(), z.number()]);
      expect(schema.parse("hello")).toBe("hello");
      expect(schema.parse(42)).toBe(42);
      expect(schema.safeParse(true).success).toBe(false);
    });

    test("discriminatedUnion() で判別フィールドによる分岐", () => {
      const schema = z.discriminatedUnion("type", [
        z.object({ type: z.literal("text"), content: z.string() }),
        z.object({ type: z.literal("image"), url: z.string().url() }),
      ]);

      expect(
        schema.parse({ type: "text", content: "Hello" })
      ).toEqual({ type: "text", content: "Hello" });

      expect(
        schema.parse({ type: "image", url: "https://example.com/img.png" })
      ).toEqual({ type: "image", url: "https://example.com/img.png" });

      expect(
        schema.safeParse({ type: "video", src: "movie.mp4" }).success
      ).toBe(false);
    });
  });

  describe("array — 配列スキーマ", () => {
    test("z.array() で配列の要素を検証する", () => {
      const schema = z.array(z.string());
      expect(schema.parse(["a", "b", "c"])).toEqual(["a", "b", "c"]);
      expect(schema.safeParse(["a", 1, "c"]).success).toBe(false);
    });

    test("min() / max() で配列の長さを制限する", () => {
      const schema = z.array(z.number()).min(1).max(5);
      expect(schema.safeParse([]).success).toBe(false);
      expect(schema.safeParse([1]).success).toBe(true);
      expect(schema.safeParse([1, 2, 3, 4, 5]).success).toBe(true);
      expect(schema.safeParse([1, 2, 3, 4, 5, 6]).success).toBe(false);
    });

    test("nonempty() で空配列を拒否する", () => {
      const schema = z.array(z.string()).nonempty();
      expect(schema.safeParse([]).success).toBe(false);
      expect(schema.safeParse(["a"]).success).toBe(true);
    });
  });

  describe("object の変形メソッド", () => {
    const UserSchema = z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email(),
      age: z.number(),
    });

    test("pick() で必要なフィールドだけ選ぶ", () => {
      const NameOnly = UserSchema.pick({ name: true });
      expect(NameOnly.parse({ name: "太郎" })).toEqual({ name: "太郎" });
      // 他のフィールドは不要
      expect(
        NameOnly.parse({ name: "太郎", id: 1, email: "a@b.com", age: 30 })
      ).toEqual({ name: "太郎" });
    });

    test("omit() で不要なフィールドを除外する", () => {
      const WithoutId = UserSchema.omit({ id: true });
      const result = WithoutId.parse({
        name: "太郎",
        email: "taro@example.com",
        age: 30,
      });
      expect(result).toEqual({
        name: "太郎",
        email: "taro@example.com",
        age: 30,
      });
      // id は不要
      expect((result as Record<string, unknown>).id).toBeUndefined();
    });

    test("partial() で全フィールドをオプショナルにする", () => {
      const PartialUser = UserSchema.partial();
      // 空オブジェクトでもOK
      expect(PartialUser.parse({})).toEqual({});
      // 一部だけでもOK
      expect(PartialUser.parse({ name: "太郎" })).toEqual({
        name: "太郎",
      });
    });

    test("extend() でフィールドを追加する", () => {
      const UserWithRole = UserSchema.extend({
        role: z.enum(["admin", "user"]),
      });
      const result = UserWithRole.parse({
        id: 1,
        name: "太郎",
        email: "taro@example.com",
        age: 30,
        role: "admin",
      });
      expect(result.role).toBe("admin");
    });

    test("pick → extend の組み合わせで新規作成用スキーマを作る", () => {
      // idを除いてcreatedAtを追加
      const CreateUserSchema = UserSchema.omit({ id: true }).extend({
        password: z.string().min(8),
      });

      const result = CreateUserSchema.parse({
        name: "太郎",
        email: "taro@example.com",
        age: 30,
        password: "MyPassw0rd",
      });
      expect(result).toEqual({
        name: "太郎",
        email: "taro@example.com",
        age: 30,
        password: "MyPassw0rd",
      });
    });
  });

  describe("実践: フォームスキーマの設計パターン", () => {
    test("基本のユーザースキーマから派生スキーマを作る", () => {
      // ベースとなるスキーマ
      const BaseUserSchema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
        age: z.coerce.number().int().min(0).max(150),
        role: z.enum(["admin", "editor", "viewer"]).default("viewer"),
      });

      // 新規作成: パスワード必須
      const CreateUserSchema = BaseUserSchema.extend({
        password: z.string().min(8),
      });

      // 更新: 全フィールドオプショナル
      const UpdateUserSchema = BaseUserSchema.partial();

      // 検索: 名前とロールだけ
      const SearchUserSchema = BaseUserSchema.pick({
        name: true,
        role: true,
      }).partial();

      // 新規作成のテスト
      expect(
        CreateUserSchema.parse({
          name: "太郎",
          email: "taro@example.com",
          age: "25",
          password: "MyPassw0rd",
        })
      ).toEqual({
        name: "太郎",
        email: "taro@example.com",
        age: 25,
        role: "viewer",
        password: "MyPassw0rd",
      });

      // 更新のテスト（名前だけ変更）
      // partial() でも default() を持つフィールドはデフォルト値が適用される
      expect(UpdateUserSchema.parse({ name: "次郎" })).toEqual({
        name: "次郎",
        role: "viewer",
      });

      // 検索のテスト
      expect(SearchUserSchema.parse({ role: "admin" })).toEqual({
        role: "admin",
      });
    });
  });
});
