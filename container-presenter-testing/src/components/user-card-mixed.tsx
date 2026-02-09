/**
 * Mixed Component（Container + Presenterが混在）
 *
 * - データ取得ロジックとUIが1つのコンポーネントに混在
 * - Container/Presenterパターンとの対比用
 */

import { useState, useEffect, useCallback } from "react";

export type FetchUser = () => Promise<{ name: string; email: string }>;

export function UserCardMixed({ fetchUser }: { fetchUser: FetchUser }) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchUser();
      setUser(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "不明なエラー");
    } finally {
      setIsLoading(false);
    }
  }, [fetchUser]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return <p>読み込み中...</p>;
  }

  if (error) {
    return (
      <div>
        <p role="alert">{error}</p>
        <button onClick={load}>再試行</button>
      </div>
    );
  }

  return (
    <div>
      <h2>{user?.name}</h2>
      <p>{user?.email}</p>
      <button onClick={load}>更新</button>
    </div>
  );
}
