import {
  useForm,
  getFormProps,
  getInputProps,
} from "@conform-to/react";

/**
 * ① a11y属性の自動生成 + useFormのコア
 *
 * Zodなしで確認できること：
 * - getFormProps: form要素にid, onSubmit, noValidateを自動設定
 * - getInputProps: input要素にname, id, type, required, aria-*を自動生成
 * - constraint: HTML制約バリデーション属性の設定
 * - fields.*.id: label要素のhtmlForと一致するidの自動生成
 */

interface SignupSchema {
  email: string;
  password: string;
}

export function SignupForm() {
  const [form, fields] = useForm<SignupSchema>({
    id: "signup",
    constraint: {
      email: { required: true },
      password: { required: true, minLength: 8 },
    },
  });

  return (
    <form {...getFormProps(form)}>
      <div>
        <label htmlFor={fields.email.id}>メールアドレス</label>
        <input {...getInputProps(fields.email, { type: "email" })} />
      </div>
      <div>
        <label htmlFor={fields.password.id}>パスワード</label>
        <input {...getInputProps(fields.password, { type: "password" })} />
      </div>
      <button type="submit">登録</button>
    </form>
  );
}
