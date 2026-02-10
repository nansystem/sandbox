import { z } from "zod";

describe("型推論 (z.infer / z.input / z.output)", () => {
  describe("z.infer", () => {
    it("スキーマから推論された型と実データが一致する", () => {
      const UserSchema = z.object({
        name: z.string(),
        age: z.number(),
        isActive: z.boolean(),
        tags: z.array(z.string()),
      });

      // z.infer<typeof UserSchema> で型を取得
      type User = z.infer<typeof UserSchema>;

      const user: User = {
        name: "太郎",
        age: 25,
        isActive: true,
        tags: ["admin", "editor"],
      };

      expect(UserSchema.parse(user)).toEqual(user);
    });

    it("ネストされたオブジェクトでも型推論が働く", () => {
      const AddressSchema = z.object({
        city: z.string(),
        zip: z.string(),
      });

      const PersonSchema = z.object({
        name: z.string(),
        address: AddressSchema,
        friends: z.array(z.object({ name: z.string() })),
      });

      type Person = z.infer<typeof PersonSchema>;

      const person: Person = {
        name: "太郎",
        address: { city: "東京", zip: "100-0001" },
        friends: [{ name: "花子" }],
      };

      expect(PersonSchema.parse(person)).toEqual(person);
    });

    it("optionalやnullableの型推論", () => {
      const schema = z.object({
        required: z.string(),
        optional: z.string().optional(),
        nullable: z.string().nullable(),
        nullish: z.string().nullish(),
        withDefault: z.string().default("default"),
      });

      type Schema = z.infer<typeof schema>;

      // optionalフィールドは省略可能
      const minimal: Schema = {
        required: "hello",
        nullable: null,
        withDefault: "custom",
      };

      expect(schema.parse(minimal)).toEqual({
        required: "hello",
        nullable: null,
        withDefault: "custom",
      });
    });
  });

  describe("z.input vs z.output (transform使用時)", () => {
    it("transformがある場合、inputとoutputの型が異なる", () => {
      const schema = z.object({
        age: z.string().transform((val) => Number(val)),
        name: z.string().transform((val) => val.toUpperCase()),
      });

      // z.input: transform前の型 (string, string)
      type Input = z.input<typeof schema>;
      const input: Input = { age: "25", name: "taro" };

      // z.output: transform後の型 (number, string)
      type Output = z.output<typeof schema>;
      const output: Output = schema.parse(input);

      expect(output.age).toBe(25);
      expect(typeof output.age).toBe("number");
      expect(output.name).toBe("TARO");
    });
  });

  describe("再帰型", () => {
    it("z.lazy で再帰的なスキーマを定義できる", () => {
      type Category = {
        name: string;
        children: Category[];
      };

      const CategorySchema: z.ZodType<Category> = z.object({
        name: z.string(),
        children: z.lazy(() => z.array(CategorySchema)),
      });

      const data: Category = {
        name: "ルート",
        children: [
          {
            name: "子1",
            children: [
              {
                name: "孫1",
                children: [],
              },
            ],
          },
          {
            name: "子2",
            children: [],
          },
        ],
      };

      expect(CategorySchema.parse(data)).toEqual(data);
    });
  });

  describe("スキーマからの型ユーティリティ", () => {
    it("partialやpickの結果からも型推論できる", () => {
      const UserSchema = z.object({
        id: z.number(),
        name: z.string(),
        email: z.string().email(),
        password: z.string(),
      });

      type CreateUser = z.infer<typeof UserSchema>;
      type UpdateUser = z.infer<ReturnType<typeof UserSchema.partial>>;
      type PublicUser = z.infer<
        ReturnType<typeof UserSchema.pick<{ id: true; name: true }>>
      >;

      const createUser: CreateUser = {
        id: 1,
        name: "太郎",
        email: "taro@example.com",
        password: "secret",
      };

      const updateUser: UpdateUser = { name: "次郎" };

      const publicUser: PublicUser = { id: 1, name: "太郎" };

      expect(UserSchema.parse(createUser)).toEqual(createUser);
      expect(UserSchema.partial().parse(updateUser)).toEqual(updateUser);
      expect(
        UserSchema.pick({ id: true, name: true }).parse(publicUser)
      ).toEqual(publicUser);
    });
  });
});
