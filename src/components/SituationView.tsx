import { useMemo, useState } from 'react'
import { copyText } from '../lib/format'
import {
  CLOSENESS_LABEL,
  CLOSENESS_NOTE,
  emotionLabel,
  findSituations,
  situationNeta,
  sourcesOf,
  SOURCE_KINDS,
  SOURCE_LABEL,
  toWorksheet,
  topicLabel,
  type Closeness,
  type Situation,
  type Source,
  type SourceKind,
} from '../lib/situations'
import { savedStore } from '../lib/storage'

/**
 * 話したいことから、いまの情景を引っ張り出す。
 * ここでは文章を組み立てない。両側を並べて、つなぐのは語り手。
 *
 * 画面の作り：
 * - 一覧は一行ずつ。場面の名と「そこで思っていること」だけ見せて、あとは畳む。
 *   （十二件すべてを開いて並べると、どれも同じ重さになって選べない）
 * - 近さで束に分け、見出しで示す。並び順だけでは目で見て分からない。
 * - 気持ちの札は一覧に出さない。「穏やか・満たされている」が病室の窓に付くと、
 *   合っている合っていないの判断を邪魔するだけになる。開いたときに小さく出す。
 * - ボタンは開いた一件にだけ出す。
 */

const ORDER: Closeness[] = ['near', 'some', 'far']

export default function SituationView({ onSaved }: { onSaved?: (ids: string[]) => void }) {
  const [kind, setKind] = useState<SourceKind>('concept')
  const [q, setQ] = useState('')
  const [picked, setPicked] = useState<Source | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  // 近いところは全部出す。それ以外は、はじめ数件だけにして畳んでおく。
  // 一度に十数件並べると、どれも同じ重さになって選べない。
  const [expanded, setExpanded] = useState<Closeness[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<string[]>(() =>
    savedStore.list().map((x) => x.neta.id),
  )

  const list = useMemo(() => {
    const all = sourcesOf(kind)
    const term = q.trim()
    return term === '' ? all : all.filter((s) => s.search.includes(term))
  }, [kind, q])

  const groups = useMemo(() => {
    const found = picked ? findSituations(picked) : []
    return ORDER.map((c) => ({ closeness: c, items: found.filter((x) => x.closeness === c) }))
      .filter((g) => g.items.length > 0)
  }, [picked])

  const copy = async (text: string, what: string) => {
    const ok = await copyText(text)
    setMsg(ok ? `${what}をコピーしました` : 'コピーできませんでした')
    setTimeout(() => setMsg(null), 2200)
  }

  const save = (sit: Situation) => {
    if (!picked) return
    const next = savedStore.add({
      neta: situationNeta(picked, sit),
      memo: '',
      savedAt: new Date().toISOString(),
      fromEmotions: sit.sharedEmotions,
      fromText: '',
    })
    const ids = next.map((x) => x.neta.id)
    setSavedIds(ids)
    onSaved?.(ids)
    setMsg('ネタ帳に入れました。メモを足して〈AIに渡す〉へ')
    setTimeout(() => setMsg(null), 2600)
  }

  const choose = (s: Source) => {
    setPicked(s)
    setOpenId(null)
    setExpanded([])
  }

  const switchKind = (k: SourceKind) => {
    setKind(k)
    setPicked(null)
    setQ('')
  }

  /** 一件ぶん。畳んだ状態は、場面の名と思いの一行だけ */
  const row = (sit: Situation) => {
    const m = sit.modern
    const open = openId === m.id
    const saved = picked ? savedIds.includes(situationNeta(picked, sit).id) : false
    return (
      <div key={m.id} className={`card overflow-hidden ${open ? 'border-enji/40' : ''}`}>
        <button
          type="button"
          className="w-full px-4 py-3 text-left transition-colors hover:bg-stone-50"
          onClick={() => setOpenId(open ? null : m.id)}
        >
          <div className="flex items-baseline gap-2">
            <h3 className="text-[15px] font-bold leading-snug">{m.scene}</h3>
            <span className="ml-auto shrink-0 text-xs text-stone-400">{open ? '閉じる' : 'ひらく'}</span>
          </div>
          <p className="mt-0.5 text-sm leading-relaxed text-stone-600">{m.omoi}</p>
        </button>

        {open && (
          <div className="border-t border-stone-100 px-4 py-3">
            <div className="label">語り出しに使える一文</div>
            <p className="mt-1 text-[15px] leading-relaxed">{m.line}</p>

            <p className="mt-2.5 text-xs leading-relaxed text-stone-500">
              重なっているところ：
              <span className="text-enji">{sit.sharedTopics.map(topicLabel).join('・')}</span>
              {sit.sharedEmotions.length > 0 && (
                <>
                  {sit.sharedTopics.length > 0 && '／'}
                  {sit.sharedEmotions.map(emotionLabel).join('・')}
                </>
              )}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn-ghost" onClick={() => copy(m.line, '語り出し')}>
                語り出しをコピー
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => picked && copy(toWorksheet(picked, sit), '下ごしらえの用紙')}
              >
                下ごしらえの用紙
              </button>
              {saved ? (
                <span className="btn-ghost text-stone-400">ネタ帳に入れた</span>
              ) : (
                <button type="button" className="btn-primary" onClick={() => save(sit)}>
                  ネタ帳に入れる
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!picked) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {SOURCE_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              className={`chip ${kind === k ? 'chip-on' : ''}`}
              onClick={() => switchKind(k)}
            >
              {SOURCE_LABEL[k]}
            </button>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-stone-500">
          話したいことを選ぶと、それに近い<span className="font-bold">いまの情景</span>が並びます。
          文章は組み立てません。つなぐところは、ご自身の言葉で。
        </p>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={
            kind === 'concept'
              ? '言葉や問いで探す（例：報われない、がんばれば、無常）'
              : kind === 'phrase'
                ? '一節や出典で探す（例：歎異抄、御文、恩徳讃）'
                : '人物や品物で探す（例：たくあん、お茶、掃除）'
          }
          className="min-h-tap w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
        <p className="text-xs text-stone-500">{list.length}件</p>
        <div className="flex flex-col gap-2">
          {list.map((s) => (
            <button
              key={s.id}
              type="button"
              className="card px-4 py-3 text-left transition-colors hover:bg-stone-50"
              onClick={() => choose(s)}
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <h3 className="text-base font-bold leading-snug">{s.title}</h3>
                <span className="text-xs text-stone-500">{s.sub}</span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-stone-700">{s.body}</p>
              <p className="mt-1 text-xs leading-relaxed text-enji">{s.hint}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 話したいことは、上に小さく留めておく。何の話を探しているのか見失わないように */}
      <section className="sticky top-0 z-10 -mx-4 border-b border-stone-200 bg-white/95 px-4 py-2.5 backdrop-blur">
        <div className="flex items-baseline gap-2">
          <h2 className="text-base font-bold leading-snug">{picked.title}</h2>
          <button
            type="button"
            className="ml-auto shrink-0 text-xs text-stone-500 underline"
            onClick={() => setPicked(null)}
          >
            選び直す
          </button>
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-stone-600">{picked.hint}</p>
      </section>

      {msg && <p className="text-xs text-matcha">{msg}</p>}

      {groups.map((g) => {
        const open = g.closeness === 'near' || expanded.includes(g.closeness)
        const shown = open ? g.items : g.items.slice(0, g.closeness === 'some' ? 3 : 0)
        const rest = g.items.length - shown.length
        return (
          <section key={g.closeness} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <h3 className="text-sm font-bold text-enji">{CLOSENESS_LABEL[g.closeness]}</h3>
              <span className="text-xs text-stone-500">{g.items.length}件</span>
              <span className="text-xs text-stone-400">{CLOSENESS_NOTE[g.closeness]}</span>
            </div>
            {shown.map(row)}
            {rest > 0 && (
              <button
                type="button"
                className="btn-ghost self-start"
                onClick={() => setExpanded((p) => [...p, g.closeness])}
              >
                あと{rest}件をひらく
              </button>
            )}
            {open && g.closeness !== 'near' && g.items.length > 3 && (
              <button
                type="button"
                className="self-start text-xs text-stone-500 underline"
                onClick={() => setExpanded((p) => p.filter((x) => x !== g.closeness))}
              >
                畳む
              </button>
            )}
          </section>
        )
      })}

      {groups.length === 0 && (
        <p className="text-sm leading-relaxed text-stone-500">
          近い情景が見つかりませんでした。別の言葉で試してみてください。
        </p>
      )}
    </div>
  )
}
