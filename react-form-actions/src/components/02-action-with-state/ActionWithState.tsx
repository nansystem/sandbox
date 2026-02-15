import { useActionState } from 'react'

/**
 * 02: useActionState — 状態管理
 *
 * 検証ポイント:
 * - useActionState(fn, initialState) でフォームの状態を管理
 * - fnの引数は (previousState, formData) の順番
 * - fnの戻り値が次のstateになる
 * - isPendingでローディング状態を取得できる
 */

type State = {
  message: string
} | null

async function submitAction(previousState: State, formData: FormData): Promise<State> {
  console.log('[02] previousState:', previousState)

  const email = formData.get('email') as string
  console.log('[02] 受信データ:', { email })

  // サーバー処理をシミュレート
  await new Promise(resolve => setTimeout(resolve, 1000))

  if (!email.includes('@')) {
    return { message: 'メールアドレスの形式が正しくありません。' }
  }

  return { message: `${email} で登録しました！` }
}

export function ActionWithState() {
  const [state, formAction, isPending] = useActionState(submitAction, null)

  return (
    <div>
      <h2>02: useActionState — 状態管理</h2>
      <p>
        <code>useActionState(fn, initialState)</code> でフォームの状態を管理する。
        fnは <code>(previousState, formData)</code> を受け取り、戻り値が次のstateになる。
      </p>
      <form action={formAction}>
        <div>
          <label htmlFor="email-02">メール: </label>
          <input id="email-02" name="email" type="text" required />
        </div>
        <button type="submit" disabled={isPending}>
          {isPending ? '送信中...' : '送信'}
        </button>
      </form>
      {state && <p><strong>結果:</strong> {state.message}</p>}
    </div>
  )
}
