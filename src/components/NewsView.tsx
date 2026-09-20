import { useState } from 'react'
import type { NewsTopic } from '../data/news'
import { NEWS_TOPICS } from '../data/news'
import type { Neta, SceneId, TraditionMode } from '../data/types'
import { generateNeta } from '../lib/generate'
import {
  applyNewsLead,
  classifyHeadline,
  emotionsFromHeadline,
  FEEDS,
  fetchHeadlines,
  searchFeedUrl,
  type Headline,
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
  const [feedId, setFeedId] = useState(FEEDS[0].id)
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<Headline[]>([])
  const [via, setVia] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pasted, setPasted] = useState('')
  const [picked, setPicked] = useState<{ headline: string; topic?: NewsTopic } | null>(null)
  const [results, setResults] = useState<Neta[]>([])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = query.trim()
        ? searchFeedUrl(query.trim())
        : (FEEDS.find((f) => f.id === feedId) ?? FEEDS[0]).url
      const res = await fetchHeadlines(url)
      setItems(res.items)
      setVia(res.via)
    } catch (e) {
      setItems([])
      setVia(null)
      setError(e instanceof Error ? e.message : '取得できませんでした')
    } finally {
      setLoading(false)
    }
  }

  const makeFrom = (headline: string) => {
    const topics = classifyHeadline(headline)
    const topic = topics[0]
    const emotions = emotionsFromHeadline(headline, topics)
    const netas = generateNeta({
      text: headline,
      emotions,
      sceneId,
      month,
      kojitsukeMax,
      tradition,
      seed: Math.floor(Math.random() * 1e9),
      count: COUNT,
    })
    setPicked({ headline, topic })
    setResults(applyNewsLead(netas, headline, topic))
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-stone-600">
        いま流れているニュースを、法話の入口に変えます。見出しを選ぶと、
        「値上げ」「災害」「炎上」といった<span className="font-bold">話題の型</span>
        に当てて、切り口を{COUNT}通り出します。
      </p>

      <section className="card flex flex-col gap-3 px-4 py-4">
        <div>
          <div className="label mb-1.5">どこから</div>
          <div className="flex flex-wrap gap-1.5">
            {FEEDS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`chip ${feedId === f.id && !query.trim() ? 'chip-on' : ''}`}
                onClick={() => {
                  setFeedId(f.id)
                  setQuery('')
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label mb-1.5 block" htmlFor="q">
            言葉で探す（入れるとこちらが優先されます）
          </label>
          <input
            id="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例：値上げ／介護／お寺"
            className="min-h-tap w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn-primary" onClick={load} disabled={loading}>
            {loading ? '取得中…' : '見出しを取ってくる'}
          </button>
          {via && <span className="text-xs text-stone-500">{via} 経由で取得</span>}
        </div>
        <p className="text-xs leading-relaxed text-stone-500">
          ブラウザから直接ニュースサイトを読めない決まり（CORS）があるため、
          公開の中継サービスを経由しています。止まっていると取得できません。
          そのときは下の貼り付け欄を使ってください。
        </p>
      </section>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <div className="label text-amber-700">取得できませんでした</div>
          <p className="mt-0.5 whitespace-pre-wrap text-xs leading-relaxed text-amber-800">{error}</p>
        </div>
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

      <section className="card flex flex-col gap-2 px-4 py-4">
        <label className="label" htmlFor="paste">
          見出しを貼ってネタにする（取得できないときも、これは必ず使えます）
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
        <section className="flex flex-col gap-3">
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
            <NetaCard key={n.id} neta={n} saved={savedIds.includes(n.id)} onSave={onSave} />
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
