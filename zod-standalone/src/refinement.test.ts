import { z } from "zod";

describe("カスタムバリデーション", () => {
  describe("refine() — 単純なカスタムチェック", () => {
    test("条件を満たさない場合にエラーになる", () => {
      const evenNumber = z.number().refine((val) => val % 2 === 0, {
        error: "偶数を入力してください",
      });

      expect(evenNumber.parse(4)).toBe(4);
      const result = evenNumber.safeParse(3);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "偶数を入力してください"
        );
      }
    });

    test("文字列に特定の文字が含まれるかチェックする", () => {
      const containsAt = z
        .string()
        .refine((val) => val.includes("@"), {
          error: "@を含めてください",
        });

      expect(containsAt.safeParse("user@example").success).toBe(true);
      expect(containsAt.safeParse("no-at-sign").success).toBe(false);
    });
  });

  describe("superRefine() — 複数エラーの追加", () => {
    test("1つの値に複数のカスタムエラーを付ける", () => {
      const strongPassword = z.string().superRefine((val, ctx) => {
        if (val.length < 8) {
          ctx.addIssue({
            code: "custom",
            message: "8文字以上必要です",
          });
        }
        if (!/[A-Z]/.test(val)) {
          ctx.addIssue({
            code: "custom",
            message: "大文字を1つ以上含めてください",
          });
        }
        if (!/[0-9]/.test(val)) {
          ctx.addIssue({
            code: "custom",
            message: "数字を1つ以上含めてください",
          });
        }
        if (!/[!@#$%^&*]/.test(val)) {
          ctx.addIssue({
            code: "custom",
            message: "記号(!@#$%^&*)を1つ以上含めてください",
          });
        }
      });

      // 全ての条件を満たさない場合
      const result = strongPassword.safeParse("abc");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBe(4);
      }

      // 全ての条件を満たす場合
      expect(strongPassword.safeParse("Passw0rd!").success).toBe(true);
    });
  });

  describe("superRefine() + path — フィールド間バリデーション", () => {
    test("パスワード確認の一致チェック", () => {
      const schema = z
        .object({
          password: z.string().min(8, "8文字以上入力してください"),
          confirmPassword: z.string().min(1, "確認用パスワードを入力してください"),
        })
        .superRefine((data, ctx) => {
          if (data.password !== data.confirmPassword) {
            ctx.addIssue({
              code: "custom",
              message: "パスワードが一致しません",
              path: ["confirmPassword"],
            });
          }
        });

      // 一致する場合
      const ok = schema.safeParse({
        password: "MyPassword1",
        confirmPassword: "MyPassword1",
      });
      expect(ok.success).toBe(true);

      // 一致しない場合
      const ng = schema.safeParse({
        password: "MyPassword1",
        confirmPassword: "Different",
      });
      expect(ng.success).toBe(false);
      if (!ng.success) {
        const confirmIssue = ng.error.issues.find(
          (i) => i.path.includes("confirmPassword")
        );
        expect(confirmIssue?.message).toBe("パスワードが一致しません");
      }
    });

    test("開始日 < 終了日のチェック", () => {
      const schema = z
        .object({
          startDate: z.coerce.date(),
          endDate: z.coerce.date(),
        })
        .superRefine((data, ctx) => {
          if (data.startDate >= data.endDate) {
            ctx.addIssue({
              code: "custom",
              message: "終了日は開始日より後にしてください",
              path: ["endDate"],
            });
          }
        });

      const ok = schema.safeParse({
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      });
      expect(ok.success).toBe(true);

      const ng = schema.safeParse({
        startDate: "2024-12-31",
        endDate: "2024-01-01",
      });
      expect(ng.success).toBe(false);
      if (!ng.success) {
        expect(ng.error.issues[0].message).toBe(
          "終了日は開始日より後にしてください"
        );
        expect(ng.error.issues[0].path).toContain("endDate");
      }
    });

    test("条件付き必須フィールド", () => {
      const schema = z
        .object({
          contactMethod: z.enum(["email", "phone"]),
          email: z.string().optional(),
          phone: z.string().optional(),
        })
        .superRefine((data, ctx) => {
          if (data.contactMethod === "email" && !data.email) {
            ctx.addIssue({
              code: "custom",
              message: "メールアドレスを入力してください",
              path: ["email"],
            });
          }
          if (data.contactMethod === "phone" && !data.phone) {
            ctx.addIssue({
              code: "custom",
              message: "電話番号を入力してください",
              path: ["phone"],
            });
          }
        });

      // email選択時にemail未入力
      const ng1 = schema.safeParse({
        contactMethod: "email",
        phone: "090-1234-5678",
      });
      expect(ng1.success).toBe(false);
      if (!ng1.success) {
        expect(ng1.error.issues[0].path).toContain("email");
      }

      // phone選択時にphone未入力
      const ng2 = schema.safeParse({
        contactMethod: "phone",
        email: "user@example.com",
      });
      expect(ng2.success).toBe(false);
      if (!ng2.success) {
        expect(ng2.error.issues[0].path).toContain("phone");
      }

      // 正しい組み合わせ
      const ok = schema.safeParse({
        contactMethod: "email",
        email: "user@example.com",
      });
      expect(ok.success).toBe(true);
    });
  });
});
