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

export type Feed = { id: string; label: string; items: Headline[] }
export type NewsFile = { generatedAt: string; feeds: Feed[] }

/**
 * 見出しは、ビルドのときにサーバー側で取得して news.json に書いてある。
 * ブラウザから直接ニュースサイトを読むことは CORS でできず、
 * 公開の中継サービスは当てにならなかったため、この形にしている。
 */
export async function loadNews(signal?: AbortSignal): Promise<NewsFile> {
  const res = await fetch(`./news.json?t=${Date.now()}`, { signal, cache: 'no-store' })
  if (!res.ok) throw new Error(`見出しの一覧を読めませんでした（HTTP ${res.status}）`)
  const data = (await res.json()) as NewsFile
  if (!Array.isArray(data.feeds)) throw new Error('見出しの一覧の形が違います')
  return data
}

/** 取り込んだ見出しを、言葉で絞り込む */
export function filterHeadlines(items: Headline[], query: string): Headline[] {
  const q = query.trim()
  if (!q) return items
  return items.filter((h) => h.title.includes(q) || h.source.includes(q))
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
    const digest = n.digest
      ? {
          ...n.digest,
          steps: n.digest.steps.map((line, i) =>
            i === 0 ? `「${headline}」というニュースがありました。${topic ? topic.tone : ''}` : line,
          ),
          note: `入口：今日の話題（${headline}）`,
        }
      : undefined
    return {
      ...n,
      title: topic ? `${topic.label} — ${n.title}` : n.title,
      sections,
      digest,
      cautions: [
        NEWS_CAUTION,
        ...(topic?.caution ? [`${topic.label}：${topic.caution}`] : []),
        ...n.cautions,
      ],
    }
  })
}
