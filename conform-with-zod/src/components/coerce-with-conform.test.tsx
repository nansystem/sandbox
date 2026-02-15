import { describe, expect, it } from "vitest";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod/v4";

describe("parseWithZod の自動型変換 — Zodのcoerceなしでも動く", () => {
  it("z.number()のフィールドがFormDataの文字列から自動変換される", () => {
    const schema = z.object({
      age: z.number().min(0).max(150),
    });

    const formData = new FormData();
    formData.set("age", "25");

    const submission = parseWithZod(formData, { schema });

    // Conformがz.number()を検出して文字列→数値に自動変換する
    // z.coerce.number()を使う必要がない
    expect(submission.status).toBe("success");
    if (submission.status === "success") {
      expect(submission.value.age).toBe(25);
      expect(typeof submission.value.age).toBe("number");
    }
  });

  it("z.boolean()のフィールドがcheckboxの'on'から自動変換される", () => {
    const schema = z.object({
      agree: z.boolean(),
    });

    const formData = new FormData();
    formData.set("agree", "on");

    const submission = parseWithZod(formData, { schema });

    expect(submission.status).toBe("success");
    if (submission.status === "success") {
      expect(submission.value.agree).toBe(true);
      expect(typeof submission.value.agree).toBe("boolean");
    }
  });

  it("チェックなしのboolean（FormDataに値なし）はfalseになる", () => {
    const schema = z.object({
      name: z.string().min(1),
      agree: z.boolean({ error: "同意が必要です" }),
    });

    const formData = new FormData();
    formData.set("name", "太郎");
    // agreeは未設定 = チェックボックス未チェック

    const submission = parseWithZod(formData, { schema });

    console.log("=== boolean未設定 ===", JSON.stringify(submission.status));
    if (submission.status === "success") {
      console.log("=== agree value ===", submission.value.agree);
    } else {
      const result = submission.reply();
      console.log("=== agree error ===", JSON.stringify(result.error));
    }
  });

  it("z.date()のフィールドが日付文字列から自動変換される", () => {
    const schema = z.object({
      birthday: z.date(),
    });

    const formData = new FormData();
    formData.set("birthday", "2000-01-15");

    const submission = parseWithZod(formData, { schema });

    expect(submission.status).toBe("success");
    if (submission.status === "success") {
      expect(submission.value.birthday).toBeInstanceOf(Date);
      expect(submission.value.birthday.getFullYear()).toBe(2000);
    }
  });

  it("複合スキーマで複数の型を同時に変換できる", () => {
    const schema = z.object({
      name: z.string().min(1),
      age: z.number().int().min(0),
      agree: z.boolean(),
    });

    const formData = new FormData();
    formData.set("name", "太郎");
    formData.set("age", "30");
    formData.set("agree", "on");

    const submission = parseWithZod(formData, { schema });

    expect(submission.status).toBe("success");
    if (submission.status === "success") {
      expect(submission.value).toEqual({
        name: "太郎",
        age: 30,
        agree: true,
      });
    }
  });

  it("disableAutoCoercion: trueにすると自動変換が無効になる", () => {
    const schema = z.object({
      age: z.number(),
    });

    const formData = new FormData();
    formData.set("age", "25");

    const submission = parseWithZod(formData, {
      schema,
      disableAutoCoercion: true,
    });

    // 自動変換が無効なので、文字列"25"がz.number()に渡されてエラーになる
    console.log("=== disableAutoCoercion ===", submission.status);
    expect(submission.status).toBe("error");
  });
});

describe("parseWithZod vs Zod単体 — coerceの比較", () => {
  it("Zod単体ではz.coerce.number()が必要だった", () => {
    // Zod単体: z.coerce.number()を使う
    const zodSchema = z.object({
      age: z.coerce.number().min(0),
    });
    const zodResult = zodSchema.safeParse({ age: "25" });
    expect(zodResult.success).toBe(true);
    if (zodResult.success) {
      expect(zodResult.data.age).toBe(25);
    }

    // Conform + Zod: z.number()だけでOK
    const conformSchema = z.object({
      age: z.number().min(0),
    });
    const formData = new FormData();
    formData.set("age", "25");
    const submission = parseWithZod(formData, { schema: conformSchema });
    expect(submission.status).toBe("success");
    if (submission.status === "success") {
      expect(submission.value.age).toBe(25);
    }
  });
});
