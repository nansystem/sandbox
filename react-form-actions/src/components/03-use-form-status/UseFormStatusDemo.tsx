import { useActionState } from 'react'
import { SubmitButton } from './SubmitButton.tsx'

/**
 * 03: useFormStatus — pending表示
 *
 * 検証ポイント:
 * - useFormStatusは<form>の子コンポーネントで使う（form自体のコンポーネントではNG）
 * - pending中はボタンのdisabledやテキスト変更ができる
 * - useActionStateのisPendingとの違い:
 *   useFormStatus → 子コンポーネントで使う、どのフォームかは親のformを自動検出
 *   isPending → useActionStateの戻り値、同じコンポーネントで使える
 */

type State = { message: string } | null

async function submitAction(_prev: State, formData: FormData): Promise<State> {
  const comment = formData.get('comment') as string
  console.log('[03] 受信データ:', { comment })

  // 2秒待って送信中の状態を確認しやすくする
  await new Promise(resolve => setTimeout(resolve, 2000))

  return { message: `コメント「${comment}」を受け付けました。` }
}

export function UseFormStatusDemo() {
  const [state, formAction] = useActionState(submitAction, null)

  return (
    <div>
      <h2>03: useFormStatus — pending表示</h2>
      <p>
        <code>useFormStatus</code> は <code>{'<form>'}</code> の子コンポーネントで使う。
        親の <code>{'<form>'}</code> を自動検出してpending状態を取得する。
      </p>
      <form action={formAction}>
        <div>
          <label htmlFor="comment-03">コメント: </label>
          <input id="comment-03" name="comment" type="text" required />
        </div>
        {/* useFormStatusは子コンポーネントで使う必要がある */}
        <SubmitButton />
      </form>
      {state && <p><strong>結果:</strong> {state.message}</p>}
    </div>
  )
}
