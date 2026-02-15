import { useState, useEffect } from 'react';

// ✅ 必要な useEffect の例：ブラウザAPI同期（localStorage）
function LocalStorageSync() {
  const [count, setCount] = useState(() => {
    const saved = localStorage.getItem('count');
    return saved ? parseInt(saved) : 0;
  });

  useEffect(() => {
    console.log('[LocalStorageSync] useEffect 実行: localStorage に保存');
    localStorage.setItem('count', count.toString());
  }, [count]);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>カウント: {count}</button>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        localStorage に保存されます。リロード後も値が保持されます。
      </p>
    </div>
  );
}

// ✅ 必要な useEffect の例：イベントリスナー登録
function WindowResizeListener() {
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    console.log('[WindowResizeListener] useEffect 実行: resize リスナー登録');

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);

    // cleanup 関数でリスナーを削除（重要！）
    return () => {
      console.log('[WindowResizeListener] cleanup: resize リスナー削除');
      window.removeEventListener('resize', handleResize);
    };
  }, []); // 空の依存配列 = マウント時だけ実行

  return (
    <div>
      <p>
        ウィンドウサイズ: {windowSize.width} x {windowSize.height}
      </p>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        ウィンドウをリサイズしてください。リスナーが自動的に登録・削除されます。
      </p>
    </div>
  );
}

// ✅ 必要な useEffect の例：フォーカス管理
function FocusManager() {
  const [isFocused, setIsFocused] = useState(true);

  useEffect(() => {
    console.log('[FocusManager] useEffect 実行: focus/blur リスナー登録');

    const handleFocus = () => {
      console.log('ウィンドウがフォーカスされました');
      setIsFocused(true);
    };

    const handleBlur = () => {
      console.log('ウィンドウがフォーカスを失いました');
      setIsFocused(false);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      console.log('[FocusManager] cleanup: focus/blur リスナー削除');
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return (
    <div style={{ padding: '0.5rem', backgroundColor: isFocused ? '#e8f5e9' : '#ffebee' }}>
      <p>ウィンドウ状態: {isFocused ? '✅ フォーカス中' : '❌ フォーカス喪失'}</p>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        ウィンドウを別タブに切り替えてください。
      </p>
    </div>
  );
}

export function BrowserAPIDemo() {
  return (
    <div style={{ border: '1px solid purple', padding: '1rem' }}>
      <h2>パターン3：ブラウザAPI同期</h2>
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <h3>localStorage 同期</h3>
          <LocalStorageSync />
        </div>
        <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <h3>ウィンドウ リサイズ リスナー</h3>
          <WindowResizeListener />
        </div>
        <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <h3>フォーカス管理</h3>
          <FocusManager />
        </div>
      </div>
      <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
        これらはすべて「外部システム」との同期なので、useEffect が必要です。
      </p>
    </div>
  );
}
