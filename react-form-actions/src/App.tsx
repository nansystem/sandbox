import { useState } from 'react'
import { FormAction } from './components/01-form-action/FormAction.tsx'
import { ActionWithState } from './components/02-action-with-state/ActionWithState.tsx'
import { UseFormStatusDemo } from './components/03-use-form-status/UseFormStatusDemo.tsx'
import { StructuredReturn } from './components/04-structured-return/StructuredReturn.tsx'
import { FieldErrors } from './components/05-field-errors/FieldErrors.tsx'

const demos = [
  { id: '01', label: '01: form action — 基本のフォームaction', component: FormAction },
  { id: '02', label: '02: useActionState — 状態管理', component: ActionWithState },
  { id: '03', label: '03: useFormStatus — pending表示', component: UseFormStatusDemo },
  { id: '04', label: '04: 構造化された戻り値', component: StructuredReturn },
  { id: '05', label: '05: フィールドごとのエラー表示', component: FieldErrors },
] as const

export function App() {
  const [active, setActive] = useState<string | null>(null)
  const ActiveComponent = demos.find(d => d.id === active)?.component

  return (
    <div>
      <h1>React 19 Form Actions sandbox</h1>
      <nav>
        <ul>
          {demos.map(demo => (
            <li key={demo.id}>
              <button
                onClick={() => setActive(active === demo.id ? null : demo.id)}
                style={{ fontWeight: active === demo.id ? 'bold' : 'normal' }}
              >
                {demo.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <hr />
      {ActiveComponent ? <ActiveComponent /> : <p>上のボタンからデモを選択してください。</p>}
    </div>
  )
}
