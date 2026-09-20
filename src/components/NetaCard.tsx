import { useState } from 'react'
import type { Neta } from '../data/types'
import { copyText, toOutline, toProse, toScript, toStructured } from '../lib/format'
import { buildStructure, STRUCTURES, type StructureId } from '../lib/structure'

type View = 'outline' | 'prose' | StructureId

type Props = {
  neta: Neta
  saved: boolean
  onSave: (neta: Neta) => void
  onRemove?: (id: string) => void
  /** 入口の場面・切り口を、その場で次の候補に入れ替える */
  onSwap?: (neta: Neta, kind: 'modern' | 'angle') => void
  /** 入れ替えられるもの（ニュースからの案は入口が見出しなので切り口だけ） */
  swapKinds?: ('modern' | 'angle')[]
  /** 一覧で見比べるときは要点から、読ませたいときは原稿から */
  defaultView?: View
  /** 組み合わせ用のチェック（渡したときだけ出る） */
  picked?: boolean
  onPick?: (id: string) => void
  children?: React.ReactNode
}

/**
 * 筋道の一行。「場面：〜」のように頭がついていれば、そこだけ小さく立てる。
 * 順に読むとき、いま話のどこにいるかが目で追えるように。
 */
function Step({ line }: { line: string }) {
  const at = line.indexOf('：')
  if (at < 1 || at > 12) return <span>{line}</span>
  return (
    <span>
      <span className="mr-1.5 text-xs font-bold tracking-wider text-stone-500">
        {line.slice(0, at)}
      </span>
      {line.slice(at + 1)}
    </span>
  )
}

function Stars({ n }: { n: number }) {
  return (
    <span title="こじつけ度" className="text-enji/70">
      {'●'.repeat(n)}
      <span className="text-stone-300">{'●'.repeat(3 - n)}</span>
    </span>
  )
}

export default function NetaCard({
  neta,
  saved,
  onSave,
  onRemove,
  onSwap,
  swapKinds = ['modern', 'angle'],
  defaultView = 'outline',
  picked = false,
  onPick,
  children,
}: Props) {
  const hasOutline = (neta.digest?.steps.length ?? 0) > 0
  // 掲示板・SNSは「一行と短文」がそのまま使うものなので、最初からそれを見せる
  const short = neta.minutes === 0
  const [view, setView] = useState<View>(short || !hasOutline ? 'prose' : defaultView)
  const [open, setOpen] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (kind: 'outline' | 'script' | 'prose' | StructureId) => {
    const structure = STRUCTURES.find((x) => x.id === kind)
    const text = structure
      ? toStructured(neta, structure.id)
      : kind === 'outline'
        ? toOutline(neta)
        : kind === 'script'
          ? toScript(neta)
          : toProse(neta)
    const label = structure
      ? structure.label
      : kind === 'outline'
        ? '筋道'
        : kind === 'script'
          ? '見出しつきの下書き'
          : '通し原稿'
    const ok = await copyText(text)
    setCopied(ok ? `${label}をコピーしました` : 'コピーできませんでした')
    setTimeout(() => setCopied(null), 2200)
  }

  const structure = STRUCTURES.find((x) => x.id === view)

  return (
    <article className={`card overflow-hidden ${picked ? 'ring-2 ring-enji/40' : ''}`}>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-stone-100 bg-stone-50/70 px-4 py-2.5">
        {onPick && (
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-stone-600">
            <input
              type="checkbox"
              checked={picked}
              onChange={() => onPick(neta.id)}
              className="h-4 w-4 accent-enji"
            />
            組む
          </label>
        )}
        <span className="rounded bg-matcha/10 px-2 py-0.5 text-xs font-bold text-matcha">
          {neta.angleName}
        </span>
        <Stars n={neta.kojitsuke} />
        {neta.minutes > 0 && <span className="text-xs text-stone-500">{neta.minutes}分</span>}
        <button
          type="button"
          className="ml-auto text-xs text-stone-500 underline"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? '畳む' : 'ひらく'}
        </button>
      </header>

      <div className="px-4 py-3">
        <h3 className="text-lg font-bold leading-snug">{neta.title}</h3>

        {hasOutline && (
          <div className="mt-2 flex gap-1.5">
            <button
              type="button"
              className={`chip ${view === 'outline' ? 'chip-on' : ''}`}
              onClick={() => setView('outline')}
            >
              {short ? '下ごしらえ' : '筋道'}
            </button>
            <button
              type="button"
              className={`chip ${view === 'prose' ? 'chip-on' : ''}`}
              onClick={() => setView('prose')}
            >
              {short ? '一行・短文' : '話す形'}
            </button>
            {STRUCTURES.map((st) => (
              <button
                key={st.id}
                type="button"
                className={`chip ${view === st.id ? 'chip-on' : ''}`}
                onClick={() => setView(st.id)}
                title={st.note}
              >
                {st.label}
              </button>
            ))}
          </div>
        )}

        {open && view === 'outline' && hasOutline && (
          <div className="mt-3">
            <p className="text-[15px] font-bold leading-relaxed text-enji">
              {neta.digest!.summary}
            </p>
            <ol className="mt-2 flex flex-col gap-2">
              {neta.digest!.steps.map((line, i) => (
                <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-500">
                    {i + 1}
                  </span>
                  <Step line={line} />
                </li>
              ))}
            </ol>
            <p className="mt-2 text-xs text-stone-500">{neta.digest!.note}</p>
          </div>
        )}

        {open && structure && (
          <div className="mt-3 flex flex-col gap-3">
            <p className="text-xs text-stone-500">{structure.note}</p>
            {buildStructure(neta, structure.id).map((s, i) => (
              <div key={`${s.label}-${i}`}>
                <div className="label">{s.label}</div>
                <p className="mt-0.5 whitespace-pre-wrap text-[15px] leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        )}

        {open && view === 'prose' && (
          <div className="mt-3 flex flex-col gap-3">
            {neta.sections.map((s, i) => (
              <div key={`${s.label}-${i}`}>
                <div className="label">{s.label}</div>
                <p className="mt-0.5 whitespace-pre-wrap text-[15px] leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        )}

        {open && (
          <div className="mt-3 flex flex-col gap-3">
            {neta.sources.length > 0 && (
              <div className="rounded-lg bg-stone-50 px-3 py-2">
                <div className="label">出典</div>
                <ul className="mt-0.5 text-xs leading-relaxed text-stone-600">
                  {neta.sources.map((s) => (
                    <li key={s}>・{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {neta.cautions.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                <div className="label text-amber-700">語る前に確認</div>
                <ul className="mt-0.5 text-xs leading-relaxed text-amber-800">
                  {neta.cautions.map((s) => (
                    <li key={s}>・{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {open && onSwap && (neta.alternatives?.modernIds.length ?? 0) > 1 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-stone-50 px-3 py-2">
            <span className="label">しっくり来なければ</span>
            {swapKinds.includes('modern') && (
              <button type="button" className="chip" onClick={() => onSwap(neta, 'modern')}>
                入口を変える
              </button>
            )}
            {swapKinds.includes('angle') && (
              <button type="button" className="chip" onClick={() => onSwap(neta, 'angle')}>
                切り口を変える
              </button>
            )}
          </div>
        )}

        {children}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {structure ? (
            <button type="button" className="btn-ghost" onClick={() => copy(structure.id)}>
              {structure.label}でコピー
            </button>
          ) : (
            hasOutline && (
              <button type="button" className="btn-ghost" onClick={() => copy('outline')}>
                筋道をコピー
              </button>
            )
          )}
          <button type="button" className="btn-ghost" onClick={() => copy('script')}>
            下書きをコピー
          </button>
          <button type="button" className="btn-ghost" onClick={() => copy('prose')}>
            {short ? '短文をコピー' : '通し原稿をコピー'}
          </button>
          {onRemove ? (
            <button
              type="button"
              className="btn-ghost text-stone-500"
              onClick={() => onRemove(neta.id)}
            >
              ネタ帳から外す
            </button>
          ) : (
            <button
              type="button"
              className={saved ? 'btn-ghost text-stone-400' : 'btn-primary'}
              disabled={saved}
              onClick={() => onSave(neta)}
            >
              {saved ? 'ネタ帳に入れた' : 'ネタ帳に入れる'}
            </button>
          )}
          {copied && <span className="text-xs text-matcha">{copied}</span>}
        </div>
      </div>
    </article>
  )
}
