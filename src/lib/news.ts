import { EMOTIONS } from '../data/emotions'
import { NEWS_CAUTION, NEWS_TOPICS, type NewsTopic } from '../data/news'
import type { EmotionId, Neta } from '../data/types'
import { SECTION } from './generate'

export type Headline = {
  title: string
  link: string
  source: string
  date?: string
}

export type FeedSource = { id: string; label: string; url: string }

// 公開されている RSS。ブラウザから直接は CORS で読めないため、中継を通す。
export const FEEDS: FeedSource[] = [
  { id: 'nhk', label: 'NHK 主要', url: 'https://www.nhk.or.jp/rss/news/cat0.xml' },
  { id: 'g-top', label: '総合', url: 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja' },
  {
    id: 'g-life',
    label: '暮らし',
    url: 'https://news.google.com/rss/search?q=%E6%9A%AE%E3%82%89%E3%81%97&hl=ja&gl=JP&ceid=JP:ja',
  },
  {
    id: 'g-econ',
    label: '経済',
    url: 'https://news.google.com/rss/search?q=%E7%B5%8C%E6%B8%88&hl=ja&gl=JP&ceid=JP:ja',
  },
  {
    id: 'g-society',
    label: '社会',
    url: 'https://news.google.com/rss/search?q=%E7%A4%BE%E4%BC%9A&hl=ja&gl=JP&ceid=JP:ja',
  },
]

/** 中継サービス。上から順に試す。どれも第三者のサービスなので、止まることがある。 */
const RELAYS = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
]

export function searchFeedUrl(query: string): string {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ja&gl=JP&ceid=JP:ja`
}

/** Google ニュースの見出しは「本文 - 媒体名」の形で来る */
function splitTitle(raw: string): { title: string; source: string } {
  const i = raw.lastIndexOf(' - ')
  if (i > 0 && raw.length - i < 30) {
    return { title: raw.slice(0, i).trim(), source: raw.slice(i + 3).trim() }
  }
  return { title: raw.trim(), source: '' }
}

const unwrap = (t: string) =>
  t
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim()

const tagOf = (block: string, tag: string): string => {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
  if (m) return unwrap(m[1])
  // Atom の <link href="..."/> のような自己完結タグ
  const href = block.match(new RegExp(`<${tag}[^>]*href=["']([^"']+)["'][^>]*/?>`, 'i'))
  return href ? href[1] : ''
}

/**
 * RSS / Atom から見出しを取り出す。
 * ブラウザでは DOMParser を使い、無い環境（テストなど）では素のパースに落とす。
 */
export function parseRss(xml: string, limit = 20): Headline[] {
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(xml, 'application/xml')
    if (!doc.querySelector('parsererror')) {
      const items = Array.from(doc.querySelectorAll('item, entry')).slice(0, limit)
      const out = items
        .map((el) => {
          const { title, source } = splitTitle(el.querySelector('title')?.textContent ?? '')
          const linkEl = el.querySelector('link')
          const link = linkEl?.textContent?.trim() || linkEl?.getAttribute('href') || ''
          const date =
            el.querySelector('pubDate')?.textContent ??
            el.querySelector('updated')?.textContent ??
            undefined
          return {
            title,
            link,
            source: source || (el.querySelector('source')?.textContent ?? ''),
            date: date ?? undefined,
          }
        })
        .filter((h) => h.title.length > 0)
      if (out.length > 0) return out
    }
  }
  const blocks = xml.match(/<(item|entry)[\s\S]*?<\/(item|entry)>/gi) ?? []
  return blocks
    .slice(0, limit)
    .map((block) => {
      const { title, source } = splitTitle(tagOf(block, 'title'))
      return {
        title,
        link: tagOf(block, 'link'),
        source: source || tagOf(block, 'source'),
        date: tagOf(block, 'pubDate') || tagOf(block, 'updated') || undefined,
      }
    })
    .filter((h) => h.title.length > 0)
}

export type FetchResult = { items: Headline[]; via: string }

/** 中継を順に試す。すべて駄目なら、その旨を投げる。 */
export async function fetchHeadlines(url: string, signal?: AbortSignal): Promise<FetchResult> {
  const errors: string[] = []
  for (const relay of RELAYS) {
    const target = relay(url)
    try {
      const res = await fetch(target, { signal })
      if (!res.ok) {
        errors.push(`${new URL(target).host}: HTTP ${res.status}`)
        continue
      }
      const text = await res.text()
      const items = parseRss(text)
      if (items.length === 0) {
        errors.push(`${new URL(target).host}: 見出しが取れませんでした`)
        continue
      }
      return { items, via: new URL(target).host }
    } catch (e) {
      if (signal?.aborted) throw e
      errors.push(`${new URL(target).host}: ${e instanceof Error ? e.message : '失敗'}`)
    }
  }
  throw new Error(`どの中継サービスからも取得できませんでした。\n${errors.join('\n')}`)
}

/** 見出しを、ニュースの型に当てはめる */
export function classifyHeadline(text: string): NewsTopic[] {
  const hits = NEWS_TOPICS.map((t) => ({
    topic: t,
    n: t.keywords.filter((k) => text.includes(k)).length,
  }))
    .filter((h) => h.n > 0)
    .sort((a, b) => b.n - a.n)
  return hits.slice(0, 3).map((h) => h.topic)
}

/** 見出しから気持ちを拾う（ニュースの型 → 感情、拾えなければ語から直接） */
export function emotionsFromHeadline(text: string, topics: NewsTopic[]): EmotionId[] {
  const fromTopics = topics.flatMap((t) => t.emotions)
  if (fromTopics.length > 0) return Array.from(new Set(fromTopics)).slice(0, 4)
  const direct = EMOTIONS.filter((e) => e.keywords.some((k) => text.includes(k))).map((e) => e.id)
  return direct.slice(0, 3)
}

/**
 * 生成された案の入口を、今日の話題に差し替える。
 * 扱いの注意は必ず添える（実際の出来事を材料にするため）。
 */
export function applyNewsLead(netas: Neta[], headline: string, topic?: NewsTopic): Neta[] {
  return netas.map((n) => {
    const sections = n.sections.map((sec) => {
      if (sec.label === SECTION.iriguchi) {
        return {
          label: '入口（今日の話題）',
          body: `「${headline}」というニュースがありました。${topic ? topic.tone : ''}`,
        }
      }
      if (sec.label === SECTION.memo && topic) {
        return { label: sec.label, body: `この話題の見どころ：${topic.angle}\n${sec.body}` }
      }
      return sec
    })
    return {
      ...n,
      title: topic ? `${topic.label} — ${n.title}` : n.title,
      sections,
      cautions: [
        NEWS_CAUTION,
        ...(topic?.caution ? [`${topic.label}：${topic.caution}`] : []),
        ...n.cautions,
      ],
    }
  })
}
