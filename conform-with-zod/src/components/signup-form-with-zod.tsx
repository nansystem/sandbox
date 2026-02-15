import { useForm, getFormProps, getInputProps } from "@conform-to/react";
import { parseWithZod, getZodConstraint } from "@conform-to/zod/v4";
import { z } from "zod";

/**
 * Zodなしのsignup-form.tsxとの比較ポイント:
 *
 * 1. constraint: 手動で { email: { required: true } } と書く代わりに
 *    getZodConstraint(schema) で自動生成
 *
 * 2. onValidate: parse() + resolve() で手動バリデーションする代わりに
 *    parseWithZod(formData, { schema }) で自動バリデーション
 */

export const SignupSchema = z.object({
  email: z.string().email("正しいメールアドレスを入力してください"),
  password: z.string().min(8, "8文字以上入力してください"),
});

export function SignupFormWithZod() {
  const [form, fields] = useForm({
    id: "signup-zod",
    constraint: getZodConstraint(SignupSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SignupSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <form {...getFormProps(form)}>
      <div>
        <label htmlFor={fields.email.id}>メールアドレス</label>
        <input {...getInputProps(fields.email, { type: "email" })} />
        {fields.email.errors && (
          <p role="alert">{fields.email.errors[0]}</p>
        )}
      </div>
      <div>
        <label htmlFor={fields.password.id}>パスワード</label>
        <input {...getInputProps(fields.password, { type: "password" })} />
        {fields.password.errors && (
          <p role="alert">{fields.password.errors[0]}</p>
        )}
      </div>
      <button type="submit">登録</button>
    </form>
  );
}
