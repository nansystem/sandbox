import { z, ZodError } from "zod";

describe("エラー構造の理解", () => {
  const UserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().min(0),
  });

  describe("ZodError.issues — issueの配列構造", () => {
    test("各issueは code, path, message を持つ", () => {
      const result = UserSchema.safeParse({
        name: "",
        email: "bad",
        age: -1,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(3);

        for (const issue of result.error.issues) {
          expect(issue).toHaveProperty("code");
          expect(issue).toHaveProperty("path");
          expect(issue).toHaveProperty("message");
        }
      }
    });

    test("型エラーの issue は code: 'invalid_type' を持つ", () => {
      const result = UserSchema.safeParse({
        name: 123,
        email: "user@example.com",
        age: 20,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const nameIssue = result.error.issues.find(
          (i) => i.path[0] === "name"
        );
        expect(nameIssue?.code).toBe("invalid_type");
      }
    });

    test("path はネストしたフィールドの位置を配列で表す", () => {
      const schema = z.object({
        address: z.object({
          city: z.string(),
        }),
      });
      const result = schema.safeParse({ address: { city: 123 } });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(["address", "city"]);
      }
    });

    test("配列要素のエラーは path にインデックスが含まれる", () => {
      const schema = z.object({
        tags: z.array(z.string()),
      });
      const result = schema.safeParse({ tags: ["ok", 123, "ok"] });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(["tags", 1]);
      }
    });
  });

  describe("z.flattenError() — fieldErrors / formErrors に分離", () => {
    test("フィールドごとのエラーメッセージ配列に変換する", () => {
      const result = UserSchema.safeParse({
        name: "",
        email: "bad",
        age: -1,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const flat = z.flattenError(result.error);

        // formErrors: オブジェクト全体レベルのエラー（ここでは空）
        expect(flat.formErrors).toEqual([]);

        // fieldErrors: フィールドごとのエラーメッセージ配列
        expect(flat.fieldErrors.name).toBeDefined();
        expect(flat.fieldErrors.name!.length).toBeGreaterThanOrEqual(1);
        expect(flat.fieldErrors.email).toBeDefined();
        expect(flat.fieldErrors.age).toBeDefined();
      }
    });

    test("スキーマ全体の refine エラーは formErrors に入る", () => {
      const schema = z
        .object({
          start: z.number(),
          end: z.number(),
        })
        .refine((data) => data.start < data.end, {
          error: "開始は終了より前にしてください",
        });

      const result = schema.safeParse({ start: 10, end: 5 });
      expect(result.success).toBe(false);
      if (!result.success) {
        const flat = z.flattenError(result.error);
        expect(flat.formErrors).toContain(
          "開始は終了より前にしてください"
        );
      }
    });
  });

  describe("z.treeifyError() — ネスト構造でフォーマット", () => {
    test("フィールドごとの errors 配列にアクセスできる", () => {
      const result = UserSchema.safeParse({
        name: "",
        email: "bad",
        age: -1,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const tree = z.treeifyError(result.error);

        // 各フィールドのエラーにドットアクセスできる
        expect(tree.properties?.name?.errors.length).toBeGreaterThanOrEqual(1);
        expect(tree.properties?.email?.errors.length).toBeGreaterThanOrEqual(1);
        expect(tree.properties?.age?.errors.length).toBeGreaterThanOrEqual(1);
      }
    });

    test("ネストしたオブジェクトのエラーも階層的にアクセスできる", () => {
      const schema = z.object({
        profile: z.object({
          nickname: z.string().min(1),
        }),
      });
      const result = schema.safeParse({ profile: { nickname: "" } });
      expect(result.success).toBe(false);
      if (!result.success) {
        const tree = z.treeifyError(result.error);
        expect(
          tree.properties?.profile?.properties?.nickname?.errors.length
        ).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe("複数エラーの蓄積", () => {
    test("1つのフィールドに複数のバリデーションエラーが出る場合", () => {
      // superRefine で複数 issue を追加
      const schema = z.string().superRefine((val, ctx) => {
        if (val.length < 8) {
          ctx.addIssue({
            code: "custom",
            message: "8文字以上必要です",
          });
        }
        if (!/[A-Z]/.test(val)) {
          ctx.addIssue({
            code: "custom",
            message: "大文字を含めてください",
          });
        }
        if (!/[0-9]/.test(val)) {
          ctx.addIssue({
            code: "custom",
            message: "数字を含めてください",
          });
        }
      });

      const result = schema.safeParse("abc");
      expect(result.success).toBe(false);
      if (!result.success) {
        // 3つのエラーが全て蓄積される
        expect(result.error.issues.length).toBe(3);
        const messages = result.error.issues.map((i) => i.message);
        expect(messages).toContain("8文字以上必要です");
        expect(messages).toContain("大文字を含めてください");
        expect(messages).toContain("数字を含めてください");
      }
    });
  });
});
