import { useState, useEffect } from 'react';

// ✅ 必要な useEffect の例：外部システム（API）との同期
function APIFetcher({ userId }: { userId: number }) {
  const [user, setUser] = useState<{ id: number; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`[APIFetcher] useEffect 実行: userId=${userId}`);
    setLoading(true);
    setError(null);

    // ダミーAPI呼び出し（遅延を模擬）
    const timer = setTimeout(() => {
      if (userId > 0) {
        setUser({ id: userId, name: `User ${userId}` });
      } else {
        setError('Invalid user ID');
      }
      setLoading(false);
    }, 1000);

    return () => {
      console.log(`[APIFetcher] cleanup: userId=${userId}`);
      clearTimeout(timer);
    };
  }, [userId]); // userId が変わったときだけ API を呼び出す

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p style={{ color: 'red' }}>エラー: {error}</p>;
  return <p>ユーザー: {user?.name}</p>;
}

// ❌ 悪い例：依存配列がない（毎回 API 呼び出し）
function BadAPIFetcher({ userId }: { userId: number }) {
  const [user, setUser] = useState<{ id: number; name: string } | null>(null);
  const [callCount, setCallCount] = useState(0);

  useEffect(() => {
    console.log(`[BadAPIFetcher] useEffect 実行 (${callCount + 1}回目)`);
    setCallCount((c) => c + 1);

    const timer = setTimeout(() => {
      setUser({ id: userId, name: `User ${userId}` });
    }, 500);

    return () => clearTimeout(timer);
  }); // 依存配列がない = 毎回実行される

  return (
    <div>
      <p>ユーザー: {user?.name}</p>
      <p style={{ color: 'red', fontSize: '0.9rem' }}>API呼び出し回数: {callCount}</p>
    </div>
  );
}

export function NecessaryEffectDemo() {
  const [userId, setUserId] = useState(1);
  const [showBad, setShowBad] = useState(false);

  return (
    <div style={{ border: '1px solid green', padding: '1rem', marginBottom: '1rem' }}>
      <h2>パターン2：必要な useEffect（API呼び出し）</h2>
      <button onClick={() => setUserId(userId + 1)}>ユーザーID: {userId}</button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <div>
          <h3>✅ 正しい例</h3>
          <APIFetcher userId={userId} />
        </div>
        <div>
          <h3>❌ 悪い例（依存配列なし）</h3>
          <label>
            <input type="checkbox" checked={showBad} onChange={(e) => setShowBad(e.target.checked)} />
            {' '}
            表示
          </label>
          {showBad && <BadAPIFetcher userId={userId} />}
          {showBad && (
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              毎回 useEffect が実行されて API が呼ばれています。
            </p>
          )}
        </div>
      </div>

      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        コンソールを見てください。userId が変わったときだけ API が呼ばれます。
      </p>
    </div>
  );
}
