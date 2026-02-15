import { useActionState } from 'react'

/**
 * 04: 構造化された戻り値
 *
 * 検証ポイント:
 * - actionから { success, message } の構造化データを返す
 * - 成功/失敗で表示を切り替え
 * - Conform連携時のlastResultパターンの前段
 */

type ActionResult = {
  success: boolean
  message: string
} | null

async function submitAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const age = formData.get('age') as string
  console.log('[04] 受信データ:', { age })

  await new Promise(resolve => setTimeout(resolve, 500))

  const ageNum = Number(age)
  if (isNaN(ageNum) || ageNum < 0) {
    return { success: false, message: '年齢は0以上の数値を入力してください。' }
  }
  if (ageNum > 150) {
    return { success: false, message: '年齢が大きすぎます。' }
  }

  return { success: true, message: `年齢 ${ageNum} 歳で登録しました。` }
}

export function StructuredReturn() {
  const [state, formAction, isPending] = useActionState(submitAction, null)

  return (
    <div>
      <h2>04: 構造化された戻り値</h2>
      <p>
        actionから <code>{'{ success, message }'}</code> を返し、成功/失敗で表示を分ける。
        Conformの <code>lastResult</code> パターンの前段。
      </p>
      <form action={formAction}>
        <div>
          <label htmlFor="age-04">年齢: </label>
          <input id="age-04" name="age" type="text" required />
        </div>
        <button type="submit" disabled={isPending}>
          {isPending ? '送信中...' : '送信'}
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
