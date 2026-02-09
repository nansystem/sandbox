import {
  useForm,
  getFormProps,
  getInputProps,
  getTextareaProps,
} from "@conform-to/react";
import type { SubmissionResult } from "@conform-to/dom";

/**
 * ③ エラーの「置き場所」の思想
 *
 * Zodなしで確認できること：
 * - field error: 各フィールド個別のエラー（fields.*.errors）
 * - form error: フォーム全体のエラー（form.errors）
 * - エラーがある場合のaria-invalid, aria-describedbyの自動付与
 * - errorIdによるエラーメッセージとフィールドの紐づけ
 *
 * lastResultを使ってサーバーサイドのエラーを注入し、
 * Conformのエラー構造が最初から分離されていることを確認する。
 */

interface ContactSchema {
  name: string;
  email: string;
  message: string;
}

interface ContactFormProps {
  lastResult?: SubmissionResult<string[]> | null;
}

export function ContactForm({ lastResult }: ContactFormProps) {
  const [form, fields] = useForm<ContactSchema>({
    id: "contact",
    lastResult: lastResult ?? undefined,
    constraint: {
      name: { required: true },
      email: { required: true },
      message: { required: true, minLength: 10 },
    },
  });

  return (
    <form {...getFormProps(form)}>
      {/* フォームレベルエラー: form.errorsに集約される */}
      {form.errors && (
        <div role="alert" id={form.errorId}>
          {form.errors.map((error, i) => (
            <p key={i}>{error}</p>
          ))}
        </div>
      )}

      <div>
        <label htmlFor={fields.name.id}>名前</label>
        <input {...getInputProps(fields.name, { type: "text" })} />
        {/* フィールドレベルエラー: fields.*.errorsに分離される */}
        {fields.name.errors && (
          <div id={fields.name.errorId} role="alert">
            {fields.name.errors.map((error, i) => (
              <p key={i}>{error}</p>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor={fields.email.id}>メールアドレス</label>
        <input {...getInputProps(fields.email, { type: "email" })} />
        {fields.email.errors && (
          <div id={fields.email.errorId} role="alert">
            {fields.email.errors.map((error, i) => (
              <p key={i}>{error}</p>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor={fields.message.id}>メッセージ</label>
        <textarea {...getTextareaProps(fields.message)} />
        {fields.message.errors && (
          <div id={fields.message.errorId} role="alert">
            {fields.message.errors.map((error, i) => (
              <p key={i}>{error}</p>
            ))}
          </div>
        )}
      </div>

      <button type="submit">送信</button>
    </form>
  );
}
