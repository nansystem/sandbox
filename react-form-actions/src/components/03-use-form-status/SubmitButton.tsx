import { useFormStatus } from 'react-dom'

/**
 * useFormStatusは<form>の子コンポーネントとして使う。
 * formの外やform自体のコンポーネントでは動作しない。
 */
export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {pending ? '送信中...(useFormStatus)' : '送信'}
    </button>
  )
}
