import './App.css'
import { UnnecessaryEffectDemo } from './UnnecessaryEffect'
import { NecessaryEffectDemo } from './NecessaryEffect'
import { BrowserAPIDemo } from './BrowserAPI'

function App() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>useEffect 検証デモ</h1>
      <p style={{ color: '#666' }}>
        コンソール（F12）を見ながら、各パターンを操作してください。useEffect がいつ実行されるか観察します。
      </p>

      <UnnecessaryEffectDemo />
      <NecessaryEffectDemo />
      <BrowserAPIDemo />

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f0f0' }}>
        <h3>まとめ</h3>
        <ul>
          <li>
            <strong>useEffect が不要</strong>：レンダー中に計算できるもの（パターン1）
          </li>
          <li>
            <strong>useEffect が必要</strong>：API呼び出し、ブラウザAPI同期（パターン2、3）
          </li>
          <li>
            <strong>cleanup 関数が重要</strong>：リスナー削除、タイマークリア、リソース解放
          </li>
          <li>
            <strong>依存配列の制御</strong>：いつ useEffect を実行するかを正確に指定
          </li>
        </ul>
      </div>
    </div>
  )
}

export default App
