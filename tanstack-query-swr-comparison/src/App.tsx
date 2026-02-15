import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TanStackQueryDemo } from './TanStackQueryDemo';
import { SWRDemo } from './SWRDemo';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5分
    },
  },
});

function AppContent() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>TanStack Query vs SWR 比較</h1>
      <p style={{ color: '#666' }}>
        両方のライブラリで同じデータを取得します。コンソールを見ながら、API呼び出しやキャッシング動作を観察してください。
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <TanStackQueryDemo />
        <SWRDemo />
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f0f0' }}>
        <h3>主な違い</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>項目</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>TanStack Query</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>SWR</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.5rem' }}>API の複雑さ</td>
              <td style={{ padding: '0.5rem' }}>多機能（設定が多い）</td>
              <td style={{ padding: '0.5rem' }}>シンプル</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.5rem' }}>キャッシング戦略</td>
              <td style={{ padding: '0.5rem' }}>細かく制御可能</td>
              <td style={{ padding: '0.5rem' }}>stale-while-revalidate</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.5rem' }}>DevTools</td>
              <td style={{ padding: '0.5rem' }}>✅ 内蔵（強力）</td>
              <td style={{ padding: '0.5rem' }}>❌ なし</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.5rem' }}>Bundle Size</td>
              <td style={{ padding: '0.5rem' }}>大き目</td>
              <td style={{ padding: '0.5rem' }}>小さい</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fff9e6' }}>
        <h3>🚀 セットアップ方法</h3>
        <pre style={{ backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '4px' }}>
          {`npm run dev:all  # json-server + vite を同時起動
# http://localhost:5173 でアプリを開く`}
        </pre>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
