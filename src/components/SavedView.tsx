import { useEffect, useMemo, useRef, useState } from 'react'
import type { Neta } from '../data/types'
import { combineNetas } from '../lib/combine'
import { copyText, toMarkdown } from '../lib/format'
import { savedStore, type SavedNeta } from '../lib/storage'
import NetaCard from './NetaCard'

type Props = {
  /** ネタ帳の中身が変わったことを、タブの件数へ返す */
  onChange?: (ids: string[]) => void
}

export default function SavedView({ onChange }: Props) {
  const [list, setList] = useState<SavedNeta[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [picked, setPicked] = useState<string[]>([])
  const [combined, setCombined] = useState<Neta | null>(null)
  const combinedRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setList(savedStore.list())
  }, [])

  const savedIds = useMemo(() => list.map((x) => x.neta.id), [list])

  useEffect(() => {
    onChange?.(savedIds)
    // 件数を返すだけ。onChange の同一性は当てにしない。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedIds.join(',')])

  const exportAll = async () => {
    const ok = await copyText(toMarkdown(list.map((x) => ({ neta: x.neta, memo: x.memo }))))
    setMsg(ok ? 'ネタ帳をまるごとコピーしました' : 'コピーできませんでした')
    setTimeout(() => setMsg(null), 2200)
  }

  const togglePick = (id: string) =>
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const remove = (id: string) => {
    setList(savedStore.remove(id))
    setPicked((prev) => prev.filter((x) => x !== id))
    // 消した案でできていた組み上がりは、もう元がない
    setCombined((prev) => (prev && picked.includes(id) ? null : prev))
  }

  /** ネタ帳に溜めたものを、日をまたいで組み直す */
  const combine = () => {
    // 並びはネタ帳の並びのまま（新しいものが上）
    const chosen = list.filter((x) => picked.includes(x.neta.id)).map((x) => x.neta)
    const next = combineNetas(chosen)
    setCombined(next)
    if (!next) return
    requestAnimationFrame(() => {
      combinedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  /** 組み直したものも、そのままネタ帳に入れて、次はそれをまた組める */
  const saveCombined = (neta: Neta) => {
    const from = list.filter((x) => picked.includes(x.neta.id))
    setList(
      savedStore.add({
        neta,
        memo: '',
        savedAt: new Date().toISOString(),
        fromEmotions: Array.from(new Set(from.flatMap((x) => x.fromEmotions))),
        fromText: from.map((x) => x.fromText).find((x) => x) ?? '',
      }),
    )
  }

  if (list.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-stone-500">
        まだ何も入っていません。「つくる」で出たネタを〈ネタ帳に入れる〉と、ここに溜まります。
        <br />
        保存先はこの端末のブラウザです（サーバーには送っていません）。
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-stone-600">{list.length}件</span>
        <button type="button" className="btn-ghost ml-auto" onClick={exportAll}>
          まるごとコピー（Markdown）
        </button>
      </div>
      {msg && <p className="text-xs text-matcha">{msg}</p>}

      {list.length > 1 && (
        <p className="text-xs leading-relaxed text-stone-500">
          〈組む〉を入れて二つ以上えらぶと、日をまたいで溜めたものを一本に組み直せます。
          組んだものをネタ帳に入れれば、それをまた次の材料にできます。
        </p>
      )}

      {combined && (
        <section ref={combinedRef} className="flex flex-col gap-2 scroll-mt-3">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h2 className="text-sm font-bold text-enji">組み合わせたもの</h2>
            <p className="text-xs text-stone-500">
              つなぎ目の［　］だけ、ご自身の言葉で埋めてください
            </p>
          </div>
          <NetaCard
            neta={combined}
            saved={savedIds.includes(combined.id)}
            onSave={saveCombined}
            defaultView="prose"
          />
        </section>
      )}

      {list.map((item) => (
        <NetaCard
          key={item.neta.id}
          neta={item.neta}
          saved
          onSave={() => {}}
          onRemove={remove}
          picked={picked.includes(item.neta.id)}
          onPick={list.length > 1 ? togglePick : undefined}
        >
          <div className="mt-3">
            <label className="label" htmlFor={`memo-${item.neta.id}`}>
              自分のメモ（どこで使うか、誰に話すか）
            </label>
            <textarea
              id={`memo-${item.neta.id}`}
              value={item.memo}
              onChange={(e) => setList(savedStore.updateMemo(item.neta.id, e.target.value))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              placeholder="例：来月の月参り、Aさんのお宅で"
            />
            <p className="mt-1 text-xs text-stone-400">
              {new Date(item.savedAt).toLocaleString('ja-JP')} に保存
            </p>
          </div>
        </NetaCard>
      ))}

      {picked.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-stone-200 bg-white/95 px-4 py-2.5 backdrop-blur">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2">
            <span className="text-sm">
              ネタ帳から<span className="font-bold text-enji">{picked.length}件</span>
            </span>
            <button
              type="button"
              className="btn-primary"
              disabled={picked.length < 2}
              onClick={combine}
            >
              {picked.length < 2 ? 'あと1件えらぶと組めます' : '組み合わせて一本にする'}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setPicked([])
                setCombined(null)
              }}
            >
              えらび直す
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
