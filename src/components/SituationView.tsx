import { useMemo, useState } from 'react'
import { copyText } from '../lib/format'
import { savedStore } from '../lib/storage'
import {
  emotionLabel,
  findSituations,
  sourcesOf,
  SOURCE_KINDS,
  SOURCE_LABEL,
  situationNeta,
  toWorksheet,
  topicLabel,
  type Situation,
  type Source,
  type SourceKind,
} from '../lib/situations'

/**
 * 話したいことから、いまの情景を引っ張り出す。
 * ここでは文章を組み立てない。両側を並べて、つなぐのは語り手。
 */
type Props = {
  /** ネタ帳の中身が変わったことを、タブの件数へ返す */
  onSaved?: (ids: string[]) => void
}

export default function SituationView({ onSaved }: Props) {
  const [kind, setKind] = useState<SourceKind>('concept')
  const [q, setQ] = useState('')
  const [picked, setPicked] = useState<Source | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<string[]>(() =>
    savedStore.list().map((x) => x.neta.id),
  )

  const list = useMemo(() => {
    const all = sourcesOf(kind)
    const term = q.trim()
    return term === '' ? all : all.filter((s) => s.search.includes(term))
  }, [kind, q])

  const situations = useMemo(() => (picked ? findSituations(picked) : []), [picked])

  const copy = async (text: string, what: string) => {
    const ok = await copyText(text)
    setMsg(ok ? `${what}をコピーしました` : 'コピーできませんでした')
    setTimeout(() => setMsg(null), 2200)
  }

  /** ネタ帳へ。あとでメモを足して、AIに渡す一枚にできる */
  const save = (sit: Situation) => {
    if (!picked) return
    const neta = situationNeta(picked, sit)
    const next = savedStore.add({
      neta,
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

  const switchKind = (k: SourceKind) => {
    setKind(k)
    setPicked(null)
    setQ('')
  }

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
        話したいことを選ぶと、それに近い<span className="font-bold">いまの情景</span>を並べます。
        文章は組み立てません。「この情景が、その言葉の近くにあります」までです。
        つなぐところは、ご自身の言葉で。
      </p>

      {!picked && (
        <>
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
                onClick={() => setPicked(s)}
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
        </>
      )}

      {picked && (
        <>
          <section className="card border-enji/30 px-4 py-3">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="label">話したいこと</span>
              <button
                type="button"
                className="ml-auto text-xs text-stone-500 underline"
                onClick={() => setPicked(null)}
              >
                選び直す
              </button>
            </div>
            <h2 className="mt-1 text-lg font-bold leading-snug">{picked.title}</h2>
            <p className="text-xs text-stone-500">{picked.sub}</p>
            <p className="mt-1.5 text-[15px] leading-relaxed">{picked.body}</p>
            <p className="mt-1 text-sm leading-relaxed text-enji">{picked.hint}</p>
            {picked.topics.length > 0 && (
              <p className="mt-2 text-xs text-stone-500">
                話題：{picked.topics.map(topicLabel).join('・')}
              </p>
            )}
          </section>

          {msg && <p className="text-xs text-matcha">{msg}</p>}

          <p className="text-xs text-stone-500">
            近いところにある情景を{situations.length}件。上ほど重なりが多いものです。
          </p>

          <div className="flex flex-col gap-2">
            {situations.map((sit) => (
              <article key={sit.modern.id} className="card px-4 py-3">
                <h3 className="text-base font-bold">{sit.modern.scene}</h3>
                <p className="mt-1 text-[15px] leading-relaxed">{sit.modern.line}</p>
                <p className="mt-1.5 rounded-lg bg-stone-50 px-3 py-2 text-sm leading-relaxed">
                  <span className="label">そこで思っていること </span>
                  {sit.modern.omoi}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="label">重なり</span>
                  {sit.sharedTopics.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-enji/10 px-1.5 py-0.5 text-xs text-enji"
                    >
                      {topicLabel(t)}
                    </span>
                  ))}
                  {sit.sharedEmotions.map((e) => (
                    <span
                      key={e}
                      className="rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-600"
                    >
                      {emotionLabel(e)}
                    </span>
                  ))}
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => copy(sit.modern.line, '語り出し')}
                  >
                    語り出しをコピー
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => copy(toWorksheet(picked, sit), '下ごしらえの用紙')}
                  >
                    下ごしらえの用紙をコピー
                  </button>
                  {savedIds.includes(situationNeta(picked, sit).id) ? (
                    <span className="btn-ghost text-stone-400">ネタ帳に入れた</span>
                  ) : (
                    <button type="button" className="btn-primary" onClick={() => save(sit)}>
                      ネタ帳に入れる
                    </button>
                  )}
                </div>
              </article>
            ))}
            {situations.length === 0 && (
              <p className="text-sm leading-relaxed text-stone-500">
                近い情景が見つかりませんでした。別の言葉で試してみてください。
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
