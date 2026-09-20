import { useState } from 'react'
import type { Neta } from '../data/types'
import { copyText, toOutline, toProse, toScript } from '../lib/format'

type View = 'outline' | 'prose'

type Props = {
  neta: Neta
  saved: boolean
  onSave: (neta: Neta) => void
  onRemove?: (id: string) => void
  /** 一覧で見比べるときは要点から、読ませたいときは原稿から */
  defaultView?: View
  children?: React.ReactNode
}

function Stars({ n }: { n: number }) {
  return (
    <span title="こじつけ度" className="text-enji/70">
      {'●'.repeat(n)}
      <span className="text-stone-300">{'●'.repeat(3 - n)}</span>
    </span>
  )
}

/** 「入口：既読がつかない」のような行を、見出しと中身に割る */
function splitLine(line: string): { head: string; body: string } {
  const i = line.indexOf('：')
  return i > 0 ? { head: line.slice(0, i), body: line.slice(i + 1) } : { head: '', body: line }
}

export default function NetaCard({
  neta,
  saved,
  onSave,
  onRemove,
  defaultView = 'outline',
  children,
}: Props) {
  const hasOutline = (neta.outline?.length ?? 0) > 0
  const [view, setView] = useState<View>(hasOutline ? defaultView : 'prose')
  const [open, setOpen] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  const copy = async (kind: 'outline' | 'script' | 'prose') => {
    const text =
      kind === 'outline' ? toOutline(neta) : kind === 'script' ? toScript(neta) : toProse(neta)
    const ok = await copyText(text)
    const label =
      kind === 'outline' ? '要点' : kind === 'script' ? '見出しつきの下書き' : '通し原稿'
    setCopied(ok ? `${label}をコピーしました` : 'コピーできませんでした')
    setTimeout(() => setCopied(null), 2200)
  }

  return (
    <article className="card overflow-hidden">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-stone-100 bg-stone-50/70 px-4 py-2.5">
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
              要点
            </button>
            <button
              type="button"
              className={`chip ${view === 'prose' ? 'chip-on' : ''}`}
              onClick={() => setView('prose')}
            >
              話す形
            </button>
          </div>
        )}

        {open && view === 'outline' && hasOutline && (
          <ul className="mt-3 flex flex-col gap-1.5">
            {neta.outline!.map((line, i) => {
              const { head, body } = splitLine(line)
              return (
                <li key={i} className="flex gap-2 text-[15px] leading-relaxed">
                  <span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-enji/60" />
                  <span>
                    {head && <span className="font-bold text-stone-500">{head}　</span>}
                    {body}
                  </span>
                </li>
              )
            })}
          </ul>
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

        {children}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {hasOutline && (
            <button type="button" className="btn-ghost" onClick={() => copy('outline')}>
              要点をコピー
            </button>
          )}
          <button type="button" className="btn-ghost" onClick={() => copy('script')}>
            下書きをコピー
          </button>
          <button type="button" className="btn-ghost" onClick={() => copy('prose')}>
            通し原稿をコピー
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
