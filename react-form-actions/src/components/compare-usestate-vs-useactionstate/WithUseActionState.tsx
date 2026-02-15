import { useActionState } from "react";

type State = { message: string } | null;

async function submitAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const email = formData.get("email") as string;

  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (!email.includes("@")) {
    return { message: "メールアドレスの形式が正しくありません。" };
  }
  return { message: `${email} で登録しました！` };
}

export function WithUseActionState() {
  const [state, formAction, isPending] = useActionState(submitAction, null);

  return (
    <form action={formAction}>
      <label htmlFor="email-useActionState">メール: </label>
      <input id="email-useActionState" name="email" type="text" required />
      <button type="submit" disabled={isPending}>
        {isPending ? "送信中..." : "送信"}
      </button>
      {state && <p>{state.message}</p>}
    </form>
  );
}
