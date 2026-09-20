import { useEffect, useMemo, useRef, useState } from 'react'
import type { NewsTopic } from '../data/news'
import { NEWS_TOPICS } from '../data/news'
import type { Neta, SceneId, TraditionMode } from '../data/types'
import { generateNeta, swapMaterial, type GenerateInput } from '../lib/generate'
import {
  applyNewsLead,
  classifyHeadline,
  emotionsFromHeadline,
  filterHeadlines,
  loadNews,
  type Feed,
  type NewsFile,
} from '../lib/news'
import NetaCard from './NetaCard'

type Props = {
  sceneId: SceneId
  tradition: TraditionMode
  kojitsukeMax: 1 | 2 | 3
  month: number
  savedIds: string[]
  onSave: (neta: Neta) => void
}

const COUNT = 3

export default function NewsView({
  sceneId,
  tradition,
  kojitsukeMax,
  month,
  savedIds,
  onSave,
}: Props) {
  const [news, setNews] = useState<NewsFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [feedId, setFeedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [pasted, setPasted] = useState('')
  const [picked, setPicked] = useState<{ headline: string; topic?: NewsTopic } | null>(null)
  const [results, setResults] = useState<Neta[]>([])
  const resultsRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    loadNews(ctrl.signal)
      .then((data) => {
        setNews(data)
        setFeedId((prev) => prev ?? data.feeds.find((f) => f.items.length > 0)?.id ?? null)
      })
      .catch((e) => {
        if (!ctrl.signal.aborted) setError(e instanceof Error ? e.message : '読めませんでした')
      })
    return () => ctrl.abort()
  }, [])

  const feeds: Feed[] = news?.feeds ?? []
  const feed = feeds.find((f) => f.id === feedId)
  const items = useMemo(() => filterHeadlines(feed?.items ?? [], query), [feed, query])
  const total = feeds.reduce((n, f) => n + f.items.length, 0)

  const makeFrom = (headline: string) => {
    const topics = classifyHeadline(headline)
    const topic = topics[0]
    const netas = generateNeta({
      text: headline,
      emotions: emotionsFromHeadline(headline, topics),
      sceneId,
      month,
      kojitsukeMax,
      tradition,
      seed: Math.floor(Math.random() * 1e9),
      count: COUNT,
    })
    setPicked({ headline, topic })
    setResults(applyNewsLead(netas, headline, topic))
    requestAnimationFrame(() =>
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    )
  }

  const swap = (neta: Neta, kind: 'modern' | 'angle') => {
    if (!picked) return
    const topics = classifyHeadline(picked.headline)
    const base: Omit<GenerateInput, 'pins' | 'count' | 'seed'> = {
      text: picked.headline,
      emotions: emotionsFromHeadline(picked.headline, topics),
      sceneId,
      month,
      kojitsukeMax,
      tradition,
    }
    const swapped = swapMaterial(neta, base, kind, Math.floor(Math.random() * 1e9))
    const [next] = applyNewsLead([swapped], picked.headline, picked.topic)
    setResults((prev) => prev.map((n) => (n.id === neta.id ? next : n)))
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-stone-600">
        見出しを選ぶと、「値上げ」「災害」「炎上」などの
        <span className="font-bold">話題の型</span>に当てて{COUNT}通り出します。
      </p>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <div className="label text-amber-700">見出しを読み込めませんでした</div>
          <p className="mt-0.5 text-xs leading-relaxed text-amber-800">
            {error}　下の貼り付け欄はそのまま使えます。
          </p>
        </div>
      )}

      {news && total === 0 && !error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
          今回の取り込みでは見出しが入っていませんでした（配信元の一時的な不調が考えられます）。
          下の貼り付け欄をお使いください。
        </div>
      )}

      {total > 0 && (
        <section className="card flex flex-col gap-3 px-4 py-4">
          <div>
            <div className="label mb-1.5">どこから</div>
            <div className="flex flex-wrap gap-1.5">
              {feeds
                .filter((f) => f.items.length > 0)
                .map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`chip ${feedId === f.id ? 'chip-on' : ''}`}
                    onClick={() => setFeedId(f.id)}
                  >
                    {f.label}（{f.items.length}）
                  </button>
                ))}
            </div>
          </div>
          <div>
            <label className="label mb-1.5 block" htmlFor="q">
              言葉で絞る
            </label>
            <input
              id="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="例：値上げ／介護／地震"
              className="min-h-tap w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <p className="text-xs text-stone-500">
            NHK・Google ニュースから取り込み／
            {news ? new Date(news.generatedAt).toLocaleString('ja-JP') : '—'} 時点
          </p>
        </section>
      )}

      {items.length > 0 && (
        <section className="flex flex-col gap-2">
          <div className="label">見出し（{items.length}件）</div>
          {items.map((h, i) => {
            const topic = classifyHeadline(h.title)[0]
            return (
              <div key={`${h.link}-${i}`} className="card px-4 py-3">
                <p className="text-[15px] font-bold leading-snug">{h.title}</p>
                <p className="mt-1 text-xs text-stone-500">
                  {h.source}
                  {h.date ? ` ・ ${new Date(h.date).toLocaleString('ja-JP')}` : ''}
                  {topic ? ` ・ 型：${topic.label}` : ' ・ 型：当てはまるものなし'}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" className="btn-primary" onClick={() => makeFrom(h.title)}>
                    この話題でネタを作る
                  </button>
                  {h.link && (
                    <a
                      className="btn-ghost inline-flex items-center"
                      href={h.link}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      元記事を読む
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </section>
      )}

      {total > 0 && items.length === 0 && (
        <p className="text-sm text-stone-500">この言葉を含む見出しはありませんでした。</p>
      )}

      <section className="card flex flex-col gap-2 px-4 py-4">
        <label className="label" htmlFor="paste">
          見出しを貼ってネタにする
        </label>
        <textarea
          id="paste"
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          rows={2}
          placeholder="例：電気代など相次ぐ値上げ　家計への影響は"
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          className="btn-primary self-start"
          disabled={!pasted.trim()}
          onClick={() => makeFrom(pasted.trim())}
        >
          この見出しでネタを作る
        </button>
      </section>

      {picked && results.length > 0 && (
        <section ref={resultsRef} className="flex flex-col gap-3 scroll-mt-3">
          <div className="rounded-lg bg-stone-50 px-3 py-2">
            <div className="label">元にした話題</div>
            <p className="mt-0.5 text-sm leading-relaxed">{picked.headline}</p>
            {picked.topic && (
              <p className="mt-1 text-xs leading-relaxed text-stone-600">
                型：{picked.topic.label} ／ 見どころ：{picked.topic.angle}
              </p>
            )}
          </div>
          {results.map((n) => (
            <NetaCard
              key={n.id}
              neta={n}
              saved={savedIds.includes(n.id)}
              onSave={onSave}
              onSwap={swap}
              swapKinds={['angle']}
            />
          ))}
        </section>
      )}

      <details className="text-xs text-stone-500">
        <summary className="cursor-pointer">内蔵している「話題の型」（{NEWS_TOPICS.length}種）</summary>
        <ul className="mt-2 space-y-1 leading-relaxed">
          {NEWS_TOPICS.map((t) => (
            <li key={t.id}>
              ・{t.label}：{t.angle}
              {t.caution && <span className="text-amber-700">（{t.caution}）</span>}
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
