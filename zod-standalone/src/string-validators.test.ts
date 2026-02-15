import { z } from "zod";

describe("文字列の組み込みバリデータ", () => {
  describe("email バリデーション", () => {
    test("z.string().email() で有効なメールアドレスを受け付ける", () => {
      const schema = z.string().email();
      expect(schema.safeParse("user@example.com").success).toBe(true);
    });

    test("z.string().email() で無効なメールアドレスを拒否する", () => {
      const schema = z.string().email();
      expect(schema.safeParse("not-an-email").success).toBe(false);
      expect(schema.safeParse("@example.com").success).toBe(false);
      expect(schema.safeParse("user@").success).toBe(false);
    });

    test("z.email() でもバリデーションできる（v4のスタンドアロン形式）", () => {
      const schema = z.email();
      expect(schema.safeParse("user@example.com").success).toBe(true);
      expect(schema.safeParse("bad").success).toBe(false);
    });
  });

  describe("url バリデーション", () => {
    test("z.string().url() で有効なURLを受け付ける", () => {
      const schema = z.string().url();
      expect(schema.safeParse("https://example.com").success).toBe(true);
      expect(schema.safeParse("http://localhost:3000").success).toBe(true);
    });

    test("z.string().url() で無効なURLを拒否する", () => {
      const schema = z.string().url();
      expect(schema.safeParse("not-a-url").success).toBe(false);
    });
  });

  describe("min / max / length", () => {
    test("min() で最小文字数を検証する", () => {
      const schema = z.string().min(3);
      expect(schema.safeParse("ab").success).toBe(false);
      expect(schema.safeParse("abc").success).toBe(true);
      expect(schema.safeParse("abcd").success).toBe(true);
    });

    test("max() で最大文字数を検証する", () => {
      const schema = z.string().max(5);
      expect(schema.safeParse("abcde").success).toBe(true);
      expect(schema.safeParse("abcdef").success).toBe(false);
    });

    test("min() と max() を組み合わせて範囲を指定する", () => {
      const schema = z.string().min(2).max(10);
      expect(schema.safeParse("a").success).toBe(false);
      expect(schema.safeParse("ab").success).toBe(true);
      expect(schema.safeParse("abcdefghij").success).toBe(true);
      expect(schema.safeParse("abcdefghijk").success).toBe(false);
    });
  });

  describe("nonempty — 空文字の拒否", () => {
    test("nonempty() は空文字を拒否する", () => {
      const schema = z.string().nonempty();
      expect(schema.safeParse("").success).toBe(false);
      expect(schema.safeParse("a").success).toBe(true);
    });

    test("nonempty() は min(1) と同じ意味", () => {
      const nonempty = z.string().nonempty();
      const min1 = z.string().min(1);
      const inputs = ["", "a", "abc"];
      for (const input of inputs) {
        expect(nonempty.safeParse(input).success).toBe(
          min1.safeParse(input).success
        );
      }
    });
  });

  describe("regex — 正規表現による検証", () => {
    test("regex() でパターンに一致する文字列を受け付ける", () => {
      const schema = z.string().regex(/^[A-Z]{3}-\d{4}$/);
      expect(schema.safeParse("ABC-1234").success).toBe(true);
      expect(schema.safeParse("abc-1234").success).toBe(false);
      expect(schema.safeParse("AB-123").success).toBe(false);
    });
  });

  describe("trim / toLowerCase — 変換系", () => {
    test("trim() は前後の空白を除去してからバリデーションする", () => {
      const schema = z.string().trim().min(1);
      // 空白のみだとtrim後に空文字になりmin(1)で失敗
      expect(schema.safeParse("   ").success).toBe(false);
      // 前後に空白があってもtrimされる
      expect(schema.parse("  hello  ")).toBe("hello");
    });

    test("toLowerCase() は小文字に変換する", () => {
      const schema = z.string().toLowerCase();
      expect(schema.parse("HELLO")).toBe("hello");
      expect(schema.parse("Hello World")).toBe("hello world");
    });

    test("toUpperCase() は大文字に変換する", () => {
      const schema = z.string().toUpperCase();
      expect(schema.parse("hello")).toBe("HELLO");
    });

    test("trim() と toLowerCase() を組み合わせてフォーム入力を正規化する", () => {
      const emailSchema = z.string().trim().toLowerCase().email();
      expect(emailSchema.parse("  User@Example.COM  ")).toBe(
        "user@example.com"
      );
    });
  });

  describe("フォーム入力でよく使うパターン", () => {
    test("ユーザー名: 英数字3〜20文字", () => {
      const username = z.string().min(3).max(20).regex(/^[a-zA-Z0-9]+$/);
      expect(username.safeParse("user123").success).toBe(true);
      expect(username.safeParse("ab").success).toBe(false);
      expect(username.safeParse("user@name").success).toBe(false);
    });

    test("パスワード: 8文字以上", () => {
      const password = z.string().min(8);
      expect(password.safeParse("short").success).toBe(false);
      expect(password.safeParse("longenough").success).toBe(true);
    });

    test("電話番号: ハイフンあり日本の電話番号", () => {
      const phone = z.string().regex(/^0\d{1,4}-\d{1,4}-\d{4}$/);
      expect(phone.safeParse("03-1234-5678").success).toBe(true);
      expect(phone.safeParse("090-1234-5678").success).toBe(true);
      expect(phone.safeParse("1234567890").success).toBe(false);
    });
  });
});
