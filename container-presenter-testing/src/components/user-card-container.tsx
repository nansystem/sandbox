/**
 * Container
 *
 * - データ取得・状態管理のロジックを担う
 * - UIの描画はPresenterに委譲する
 * - Presenterにpropsを渡すだけ
 */

import { useState, useEffect } from "react";
import { UserCardPresenter } from "./user-card-presenter";

export type FetchUser = () => Promise<{ name: string; email: string }>;

export function UserCardContainer({ fetchUser }: { fetchUser: FetchUser }) {
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

  return (
    <UserCardPresenter
      name={user?.name ?? ""}
      email={user?.email ?? ""}
      isLoading={isLoading}
      error={error}
      onRefresh={() => setRetryCount((c) => c + 1)}
    />
  );
}
