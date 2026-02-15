/**
 * 01: form action — 基本のフォームaction
 *
 * 検証ポイント:
 * - <form action={fn}> に関数を渡すと、submitでその関数がFormDataを受け取る
 * - React 19ではonSubmit + preventDefault不要
 * - フォーム送信後に自動でフォームがリセットされる
 */
export function FormAction() {
  function handleSubmit(formData: FormData) {
    const name = formData.get('name')
    console.log('[01] サーバー側で受け取る想定のデータ:', { name })
    alert(`送信されました: ${name}`)
  }

  return (
    <div>
      <h2>01: form action — 基本のフォームaction</h2>
      <p>
        <code>{'<form action={fn}>'}</code> に関数を渡す。
        submitするとその関数にFormDataが渡される。onSubmit + preventDefaultは不要。
      </p>
      <form action={handleSubmit}>
        <div>
          <label htmlFor="name-01">名前: </label>
          <input id="name-01" name="name" type="text" required />
        </div>
        <button type="submit">送信</button>
      </form>
    </div>
  )
}
