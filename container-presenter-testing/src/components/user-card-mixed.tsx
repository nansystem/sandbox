/**
 * Mixed Component（Container + Presenterが混在）
 *
 * - データ取得ロジックとUIが1つのコンポーネントに混在
 * - Container/Presenterパターンとの対比用
 */

import { useState, useEffect } from "react";

export type FetchUser = () => Promise<{ name: string; email: string }>;

export function UserCardMixed({ fetchUser }: { fetchUser: FetchUser }) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    setError(null);

    fetchUser().then(
      (data) => {
        if (!ignore) {
          setUser(data);
          setIsLoading(false);
        }
      },
      (e) => {
        if (!ignore) {
          setError(e instanceof Error ? e.message : "不明なエラー");
          setIsLoading(false);
        }
      },
    );

    return () => {
      ignore = true;
    };
  }, [fetchUser, retryCount]);

  if (isLoading) {
    return <p>読み込み中...</p>;
  }

  if (error) {
    return (
      <div>
        <p role="alert">{error}</p>
        <button onClick={() => setRetryCount((c) => c + 1)}>再試行</button>
      </div>
    );
  }

  return (
    <div>
      <h2>{user?.name}</h2>
      <p>{user?.email}</p>
      <button onClick={() => setRetryCount((c) => c + 1)}>更新</button>
    </div>
  );
}
