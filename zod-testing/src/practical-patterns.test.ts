import { z } from "zod";

describe("実践的なパターン", () => {
  describe("フォームバリデーション", () => {
    const RegistrationSchema = z
      .object({
        username: z
          .string()
          .min(3, "ユーザー名は3文字以上です")
          .max(20, "ユーザー名は20文字以下です")
          .regex(
            /^[a-zA-Z0-9_]+$/,
            "ユーザー名は英数字とアンダースコアのみ使用できます"
          ),
        email: z
          .string()
          .email("正しいメールアドレスを入力してください"),
        password: z
          .string()
          .min(8, "パスワードは8文字以上です")
          .regex(/[A-Z]/, "大文字を1つ以上含めてください")
          .regex(/[0-9]/, "数字を1つ以上含めてください"),
        confirmPassword: z.string(),
        age: z
          .number()
          .int("年齢は整数で入力してください")
          .min(13, "13歳以上である必要があります")
          .max(120, "正しい年齢を入力してください"),
        agreeToTerms: z.literal(true, {
          errorMap: () => ({ message: "利用規約への同意が必要です" }),
        }),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: "パスワードが一致しません",
        path: ["confirmPassword"],
      });

    it("有効な登録データを受け入れる", () => {
      const data = {
        username: "taro_123",
        email: "taro@example.com",
        password: "Password1",
        confirmPassword: "Password1",
        age: 25,
        agreeToTerms: true as const,
      };
      expect(RegistrationSchema.parse(data)).toEqual(data);
    });

    it("バリデーションエラーをフィールドごとに取得できる", () => {
      const result = RegistrationSchema.safeParse({
        username: "ab",
        email: "not-email",
        password: "weak",
        confirmPassword: "different",
        age: 10,
        agreeToTerms: false,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const flat = result.error.flatten();
        expect(flat.fieldErrors.username).toBeDefined();
        expect(flat.fieldErrors.email).toBeDefined();
        expect(flat.fieldErrors.password).toBeDefined();
        expect(flat.fieldErrors.age).toBeDefined();
        expect(flat.fieldErrors.agreeToTerms).toBeDefined();
      }
    });
  });

  describe("APIレスポンスのバリデーション", () => {
    const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
      z.object({
        success: z.boolean(),
        data: dataSchema,
        meta: z.object({
          page: z.number(),
          total: z.number(),
          perPage: z.number(),
        }),
      });

    const UserSchema = z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email(),
    });

    it("型パラメータ化されたレスポンススキーマで検証する", () => {
      const UserListResponse = ApiResponseSchema(z.array(UserSchema));

      const response = {
        success: true,
        data: [
          { id: 1, name: "太郎", email: "taro@example.com" },
          { id: 2, name: "花子", email: "hanako@example.com" },
        ],
        meta: { page: 1, total: 2, perPage: 10 },
      };

      expect(UserListResponse.parse(response)).toEqual(response);
    });
  });

  describe("環境変数のバリデーション", () => {
    it("環境変数スキーマで型安全にアクセスする", () => {
      const EnvSchema = z.object({
        NODE_ENV: z.enum(["development", "production", "test"]),
        PORT: z.coerce.number().int().positive().default(3000),
        DATABASE_URL: z.string().url(),
        API_KEY: z.string().min(1),
        DEBUG: z.coerce.boolean().default(false),
      });

      const env = EnvSchema.parse({
        NODE_ENV: "production",
        PORT: "8080",
        DATABASE_URL: "https://db.example.com",
        API_KEY: "secret-key",
        DEBUG: "true",
      });

      expect(env.NODE_ENV).toBe("production");
      expect(env.PORT).toBe(8080);
      expect(typeof env.PORT).toBe("number");
      expect(env.DEBUG).toBe(true);
      expect(typeof env.DEBUG).toBe("boolean");
    });
  });

  describe("判別ユニオンでイベントシステムを作る", () => {
    const NotificationSchema = z.discriminatedUnion("channel", [
      z.object({
        channel: z.literal("email"),
        to: z.string().email(),
        subject: z.string(),
        body: z.string(),
      }),
      z.object({
        channel: z.literal("sms"),
        phoneNumber: z.string().regex(/^\+?[0-9]{10,15}$/),
        message: z.string().max(160),
      }),
      z.object({
        channel: z.literal("push"),
        deviceToken: z.string(),
        title: z.string(),
        body: z.string(),
      }),
    ]);

    type Notification = z.infer<typeof NotificationSchema>;

    it("各チャネルのバリデーションが正しく動作する", () => {
      const email: Notification = {
        channel: "email",
        to: "user@example.com",
        subject: "お知らせ",
        body: "本文です",
      };
      expect(NotificationSchema.parse(email)).toEqual(email);

      const sms: Notification = {
        channel: "sms",
        phoneNumber: "+819012345678",
        message: "SMSメッセージ",
      };
      expect(NotificationSchema.parse(sms)).toEqual(sms);
    });

    it("チャネルに合わないフィールドを拒否する", () => {
      expect(() =>
        NotificationSchema.parse({
          channel: "email",
          phoneNumber: "+819012345678",
          message: "SMS?",
        })
      ).toThrow();
    });
  });

  describe("データ変換パイプライン", () => {
    it("CSVの行をパースしてオブジェクトに変換する", () => {
      const CsvRowSchema = z
        .string()
        .transform((line) => line.split(","))
        .pipe(z.tuple([z.string(), z.string(), z.string()]))
        .transform(([name, age, city]) => ({
          name,
          age: Number(age),
          city,
        }))
        .pipe(
          z.object({
            name: z.string(),
            age: z.number().int().positive(),
            city: z.string(),
          })
        );

      expect(CsvRowSchema.parse("太郎,25,東京")).toEqual({
        name: "太郎",
        age: 25,
        city: "東京",
      });
    });
  });

  describe("条件付きフィールド", () => {
    it("判別ユニオンで支払い方法ごとに異なるフィールドを要求する", () => {
      const PaymentSchema = z.discriminatedUnion("method", [
        z.object({
          method: z.literal("credit_card"),
          cardNumber: z.string().length(16),
          expiry: z.string(),
          cvv: z.string().length(3),
        }),
        z.object({
          method: z.literal("bank_transfer"),
          bankCode: z.string(),
          accountNumber: z.string(),
        }),
        z.object({
          method: z.literal("convenience_store"),
          storeType: z.enum(["seven", "lawson", "family_mart"]),
        }),
      ]);

      expect(
        PaymentSchema.parse({
          method: "credit_card",
          cardNumber: "1234567890123456",
          expiry: "12/25",
          cvv: "123",
        })
      ).toBeDefined();

      expect(
        PaymentSchema.parse({
          method: "convenience_store",
          storeType: "seven",
        })
      ).toBeDefined();

      // credit_cardにbankCodeはエラー
      expect(() =>
        PaymentSchema.parse({
          method: "credit_card",
          bankCode: "0001",
          accountNumber: "1234567",
        })
      ).toThrow();
    });
  });
});
