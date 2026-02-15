import { describe, expect, it } from "vitest";
import { z } from "zod";
import { getZodConstraint } from "@conform-to/zod/v4";

describe("getZodConstraint — ZodスキーマからHTML制約属性を生成する", () => {
  it("string().min().max()からminLength, maxLengthを生成する", () => {
    const schema = z.object({
      username: z.string().min(3).max(20),
    });

    const constraint = getZodConstraint(schema);

    expect(constraint.username).toMatchObject({
      minLength: 3,
      maxLength: 20,
    });
  });

  it("string().email()で必須かつパターン付きの制約を生成する", () => {
    const schema = z.object({
      email: z.string().email(),
    });

    const constraint = getZodConstraint(schema);

    // emailバリデータがあるとpatternが設定されるか確認
    console.log("=== email constraint ===", JSON.stringify(constraint.email, null, 2));
    expect(constraint.email).toBeDefined();
  });

  it("optional()のフィールドはrequiredがfalseになる", () => {
    const schema = z.object({
      nickname: z.string().optional(),
      bio: z.string(),
    });

    const constraint = getZodConstraint(schema);

    console.log("=== nickname constraint ===", JSON.stringify(constraint.nickname, null, 2));
    console.log("=== bio constraint ===", JSON.stringify(constraint.bio, null, 2));

    expect(constraint.nickname?.required).toBeFalsy();
    expect(constraint.bio?.required).toBe(true);
  });

  it("number().min().max()からmin, maxを生成する", () => {
    const schema = z.object({
      age: z.number().min(0).max(150),
    });

    const constraint = getZodConstraint(schema);

    console.log("=== age constraint ===", JSON.stringify(constraint.age, null, 2));
    expect(constraint.age?.min).toBe(0);
    expect(constraint.age?.max).toBe(150);
  });

  it("conform-without-zodの手動constraintと比較する", () => {
    // Zodなし（手動）:
    // const [form, fields] = useForm({
    //   constraint: {
    //     email: { required: true },
    //     password: { required: true, minLength: 8 },
    //   },
    // });

    // Zodあり（自動生成）:
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    });

    const constraint = getZodConstraint(schema);

    console.log("=== 自動生成されたconstraint ===", JSON.stringify(constraint, null, 2));

    // Zodスキーマから自動でrequired, minLength等が導出される
    expect(constraint.email?.required).toBe(true);
    expect(constraint.password?.required).toBe(true);
    expect(constraint.password?.minLength).toBe(8);
  });
});
