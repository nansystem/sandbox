"use client";

import { useQueryState, parseAsString } from "nuqs";

export function NameInput() {
  const [name, setName] = useQueryState(
    "name",
    parseAsString.withDefault("")
  );

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="名前を入力"
      />
      <p>こんにちは、{name || "ゲスト"}さん</p>
    </div>
  );
}
