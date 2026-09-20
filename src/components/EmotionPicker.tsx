import { EMOTIONS } from '../data/emotions'
import { reasonsFor } from '../data/reasons'
import type { EmotionGroup, EmotionId } from '../data/types'

const GROUP_ORDER: EmotionGroup[] = ['くるしみ', 'ざわつき', 'ゆらぎ', 'しあわせ']

type Props = {
  selected: EmotionId[]
  onToggle: (id: EmotionId) => void
  /** 自由記述から自動で拾われたもの（点線で示す） */
  detected?: EmotionId[]
  /** 一段下（「なんで？」）で選んだ理由 */
  reasons: string[]
  onToggleReason: (id: string) => void
}

export default function EmotionPicker({
  selected,
  onToggle,
  detected = [],
  reasons,
  onToggleReason,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      {GROUP_ORDER.map((group) => (
        <div key={group}>
          <div className="label mb-1.5">{group}</div>
          <div className="flex flex-wrap gap-1.5">
            {EMOTIONS.filter((e) => e.group === group).map((e) => {
              const on = selected.includes(e.id)
              const auto = !on && detected.includes(e.id)
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => onToggle(e.id)}
                  className={`chip ${on ? 'chip-on' : ''} ${
                    auto ? 'border-dashed border-enji/60 text-enji' : ''
                  }`}
                  title={e.plain}
                >
                  {e.label}
                </button>
              )
            })}
          </div>

          {/* 選んだ気持ちの下に、一段掘る問いを出す */}
          {EMOTIONS.filter((e) => e.group === group && selected.includes(e.id)).map((e) => (
            <div key={`r-${e.id}`} className="mt-1.5 rounded-lg bg-stone-50 px-3 py-2">
              <div className="text-xs text-stone-500">
                <span className="font-bold text-stone-600">{e.label}</span>　{e.question}
                <span className="ml-1 text-stone-400">（選ばなくても出ます）</span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {reasonsFor(e.id).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onToggleReason(r.id)}
                    className={`chip ${reasons.includes(r.id) ? 'chip-on' : ''}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
