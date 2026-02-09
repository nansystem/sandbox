import { useForm, getFormProps, getInputProps } from "@conform-to/react";
import type { SubmissionResult } from "@conform-to/dom";

/**
 * ① フォーム状態管理の設計思想
 *
 * Zodなしで確認できること：
 * - useFormのコアはバリデーションではなく「状態管理」
 * - defaultValueによる初期値の宣言的設定
 * - form.status: submit結果が宣言的に管理される
 * - noValidate: ブラウザ標準バリデーションを無効化しJSで制御
 * - uncontrolled前提: getInputPropsがdefaultValueを返す（valueではない）
 */

interface ProfileSchema {
  username: string;
  bio: string;
}

interface ProfileFormProps {
  lastResult?: SubmissionResult<string[]> | null;
}

export function ProfileForm({ lastResult }: ProfileFormProps) {
  const [form, fields] = useForm<ProfileSchema>({
    id: "profile",
    defaultValue: {
      username: "ゲスト",
      bio: "",
    },
    lastResult: lastResult ?? undefined,
  });

  return (
    <form {...getFormProps(form)}>
      <div>
        <label htmlFor={fields.username.id}>ユーザー名</label>
        <input {...getInputProps(fields.username, { type: "text" })} />
      </div>
      <div>
        <label htmlFor={fields.bio.id}>自己紹介</label>
        <input {...getInputProps(fields.bio, { type: "text" })} />
      </div>

      <output data-testid="form-status">{form.status ?? "未送信"}</output>

      <button type="submit">保存</button>
    </form>
  );
}
