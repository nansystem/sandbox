/**
 * Container
 *
 * - データ取得・状態管理のロジックを担う
 * - UIの描画はPresenterに委譲する
 * - Presenterにpropsを渡すだけ
 */

import { useState, useEffect, useCallback } from "react";
import { UserCardPresenter } from "./user-card-presenter";

export type FetchUser = () => Promise<{ name: string; email: string }>;

export function UserCardContainer({ fetchUser }: { fetchUser: FetchUser }) {
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

  return (
    <UserCardPresenter
      name={user?.name ?? ""}
      email={user?.email ?? ""}
      isLoading={isLoading}
      error={error}
      onRefresh={load}
    />
  );
}
