import { useActionState } from 'react'

/**
 * 05: フィールドごとのエラー表示
 *
 * 検証ポイント:
 * - actionから { success, errors: { fieldName: string[] } } を返す
 * - フィールドごとにエラーメッセージを表示
 * - Conform + Zodでのバリデーション結果返却と同じ構造
 * - errorsのキーはinputのname属性と対応させる
 */

type FieldErrorMap = Record<string, string[]>

type ActionResult = {
  success: boolean
  message: string
  errors: FieldErrorMap
} | null

async function submitAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const username = (formData.get('username') as string).trim()
  const email = (formData.get('email') as string).trim()
  const password = (formData.get('password') as string)

  console.log('[05] 受信データ:', { username, email, password: '***' })

  await new Promise(resolve => setTimeout(resolve, 500))

  const errors: FieldErrorMap = {}

  if (username.length < 3) {
    errors.username = ['ユーザー名は3文字以上で入力してください。']
  }
  if (!email.includes('@')) {
    errors.email = ['メールアドレスの形式が正しくありません。']
  }
  if (password.length < 8) {
    errors.password = ['パスワードは8文字以上で入力してください。']
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, message: '入力内容に問題があります。', errors }
  }

  return { success: true, message: `${username} さんの登録が完了しました！`, errors: {} }
}

export function FieldErrors() {
  const [state, formAction, isPending] = useActionState(submitAction, null)

  return (
    <div>
      <h2>05: フィールドごとのエラー表示</h2>
      <p>
        actionから <code>{'{ success, errors: { fieldName: string[] } }'}</code> を返す。
        Conform + Zodでのバリデーション結果返却と同じ構造。
      </p>
      <form action={formAction}>
        <div>
          <label htmlFor="username-05">ユーザー名: </label>
          <input id="username-05" name="username" type="text" />
          {state?.errors.username?.map((msg, i) => (
            <p key={i} style={{ color: 'red', margin: '2px 0' }}>{msg}</p>
          ))}
        </div>
        <div>
          <label htmlFor="email-05">メール: </label>
          <input id="email-05" name="email" type="text" />
          {state?.errors.email?.map((msg, i) => (
            <p key={i} style={{ color: 'red', margin: '2px 0' }}>{msg}</p>
          ))}
        </div>
        <div>
          <label htmlFor="password-05">パスワード: </label>
          <input id="password-05" name="password" type="password" />
          {state?.errors.password?.map((msg, i) => (
            <p key={i} style={{ color: 'red', margin: '2px 0' }}>{msg}</p>
          ))}
        </div>
        <button type="submit" disabled={isPending}>
          {isPending ? '送信中...' : '登録'}
        </button>
      </form>
      {state && (
        <p style={{ color: state.success ? 'green' : 'red' }}>
          <strong>{state.success ? '成功' : 'エラー'}:</strong> {state.message}
        </p>
      )}
    </div>
  )
}
