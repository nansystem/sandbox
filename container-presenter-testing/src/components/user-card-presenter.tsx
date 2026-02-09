/**
 * Presenter（Presentational Component）
 *
 * - propsのみに依存する純粋なコンポーネント
 * - 状態管理・データ取得のロジックを持たない
 * - UIの表示だけに責任を持つ
 */

export type UserCardProps = {
  name: string;
  email: string;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
};

export function UserCardPresenter({
  name,
  email,
  isLoading,
  error,
  onRefresh,
}: UserCardProps) {
  if (isLoading) {
    return <p>読み込み中...</p>;
  }

  if (error) {
    return (
      <div>
        <p role="alert">{error}</p>
        <button onClick={onRefresh}>再試行</button>
      </div>
    );
  }

  return (
    <div>
      <h2>{name}</h2>
      <p>{email}</p>
      <button onClick={onRefresh}>更新</button>
    </div>
  );
}
