import { useState } from "react";

type State = { message: string } | null;

export function WithUseState() {
  const [state, setState] = useState<State>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!email.includes("@")) {
      setState({ message: "メールアドレスの形式が正しくありません。" });
    } else {
      setState({ message: `${email} で登録しました！` });
    }
    setIsPending(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email-useState">メール: </label>
      <input id="email-useState" name="email" type="text" required />
      <button type="submit" disabled={isPending}>
        {isPending ? "送信中..." : "送信"}
      </button>
      {state && <p>{state.message}</p>}
    </form>
  );
}
