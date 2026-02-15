import { useState, useEffect } from 'react';

// ❌ 悪い例：useEffect で計算（不要な再レンダリング、バグの原因）
function BadFilter({ items }: { items: { id: number; name: string; active: boolean }[] }) {
  const [filtered, setFiltered] = useState<typeof items>([]);

  useEffect(() => {
    console.log('[BadFilter] useEffect 実行');
    setFiltered(items.filter((item) => item.active));
  }, [items]);

  return (
    <div>
      <h3>❌ 悪い例：useEffect で計算</h3>
      <ul>
        {filtered.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      <p>アクティブ数: {filtered.length}</p>
    </div>
  );
}

// ✅ 良い例：レンダー中に直接計算（効率的、バグなし）
function GoodFilter({ items }: { items: { id: number; name: string; active: boolean }[] }) {
  const filtered = items.filter((item) => item.active);

  return (
    <div>
      <h3>✅ 良い例：レンダー中に計算</h3>
      <ul>
        {filtered.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      <p>アクティブ数: {filtered.length}</p>
    </div>
  );
}

export function UnnecessaryEffectDemo() {
  const [items, setItems] = useState([
    { id: 1, name: 'Item 1', active: true },
    { id: 2, name: 'Item 2', active: false },
    { id: 3, name: 'Item 3', active: true },
  ]);

  return (
    <div style={{ border: '1px solid blue', padding: '1rem', marginBottom: '1rem' }}>
      <h2>パターン1：不要な useEffect</h2>
      <button onClick={() => setItems([...items, { id: 4, name: 'Item 4', active: true }])}>
        アイテムを追加
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <BadFilter items={items} />
        <GoodFilter items={items} />
      </div>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        コンソールを見てください。悪い例は毎回 useEffect が実行されています。
      </p>
    </div>
  );
}
