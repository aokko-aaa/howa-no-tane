import { useState } from 'react'
import { STEP1, STEP2, STEP3, type Shape } from '../data/paths'
import type { Neta, TraditionMode } from '../data/types'
import { buildReading } from '../lib/reading'
import NetaCard from './NetaCard'

type Props = {
  tradition: TraditionMode
  savedIds: string[]
  onSave: (neta: Neta) => void
}

const BIG = 'min-h-tap w-full rounded-xl border-2 px-4 py-3 text-left text-[15px] transition-colors'

export default function ChartView({ tradition, savedIds, onSave }: Props) {
  const [s1, setS1] = useState<string | null>(null)
  const [s2, setS2] = useState<string | null>(null)
  const [shape, setShape] = useState<Shape | null>(null)
  const [seed, setSeed] = useState(1)

  const a = STEP1.find((x) => x.id === s1)
  const b = STEP2.find((x) => x.id === s2)
  const step = !a ? 1 : !b ? 2 : !shape ? 3 : 4

  const reading =
    a && b && shape
      ? buildReading({ primary: a.emotions, secondary: b.emotions, shape, tradition, seed })
      : null

  const reset = () => {
    setS1(null)
    setS2(null)
    setShape(null)
    setSeed(1)
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-stone-600">
        三つ選ぶと、今の気持ちに合う話がひとつ出ます。
      </p>

      <div className="flex items-center gap-1.5 text-xs text-stone-500">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`h-1.5 flex-1 rounded-full ${step > n ? 'bg-enji' : step === n ? 'bg-enji/40' : 'bg-stone-200'}`}
          />
        ))}
        <span className="ml-1 w-16 text-right">{step > 3 ? '出ました' : `${step} / 3`}</span>
      </div>

      {step === 1 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-bold">いま、どんな気持ちですか</h2>
          {STEP1.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`${BIG} border-stone-300 bg-white hover:border-enji`}
              onClick={() => setS1(o.id)}
            >
              {o.label}
            </button>
          ))}
        </section>
      )}

      {step === 2 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-bold">それは、どんなことで？</h2>
          {STEP2.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`${BIG} border-stone-300 bg-white hover:border-enji`}
              onClick={() => setS2(o.id)}
            >
              {o.label}
            </button>
          ))}
          <button type="button" className="mt-1 self-start text-xs text-stone-500 underline" onClick={() => setS1(null)}>
            ひとつ戻る
          </button>
        </section>
      )}

      {step === 3 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-base font-bold">どうしたいですか</h2>
          {STEP3.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`${BIG} border-stone-300 bg-white hover:border-enji`}
              onClick={() => setShape(o.id)}
            >
              <span className="font-bold">{o.label}</span>
              <span className="mt-0.5 block text-xs text-stone-500">{o.note}</span>
            </button>
          ))}
          <button type="button" className="mt-1 self-start text-xs text-stone-500 underline" onClick={() => setS2(null)}>
            ひとつ戻る
          </button>
        </section>
      )}

      {reading && (
        <section className="flex flex-col gap-3">
          <p className="text-xs text-stone-500">
            {a?.label} → {b?.label} → {STEP3.find((x) => x.id === shape)?.label}
          </p>
          <NetaCard
            neta={reading}
            saved={savedIds.includes(reading.id)}
            onSave={onSave}
            defaultView="prose"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-ghost" onClick={() => setSeed((v) => v + 1)}>
              別の話を見る
            </button>
            <button type="button" className="btn-ghost" onClick={() => setShape(null)}>
              選び直す
            </button>
            <button type="button" className="btn-ghost text-stone-500" onClick={reset}>
              はじめから
            </button>
          </div>
          <p className="text-xs text-stone-500">
            気になった言葉は「ことば」から引けます。
          </p>
        </section>
      )}
    </div>
  )
}
