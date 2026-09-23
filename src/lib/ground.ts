import { CONCEPT_BY_ID } from '../data/concepts'
import { EMOTION_BY_ID } from '../data/emotions'
import { FIGURE_BY_ID } from '../data/figures'
import { MODERN_BY_ID } from '../data/modern'
import { PHRASE_BY_ID } from '../data/shinshu/phrases'
import { STORY_BY_ID } from '../data/stories'
import { TOPIC_BY_ID } from '../data/topics'
import type { EmotionId, Neta, NetaMaterials, TopicId } from '../data/types'
import { WORD_BY_ID } from '../data/words'

/**
 * えらんだ案の、重なっているところ。
 *
 * 一本に組み直すのは、素材の種類がそろっていないとできない。
 * けれども「どこで重なっているか」なら、どの素材にも話題と気持ちが
 * ついているので、人物どうしでも一節でも出せる。
 *
 * ここでも文章は作らない。重なっている話題ごとに、
 * 場面の側と教えの側を並べるだけで、あいだは空けておく。
 */
export type GroundItem = {
  id: string
  title: string
  topics: TopicId[]
  emotions: EmotionId[]
}

export type GroundTopic = {
  id: TopicId
  label: string
  scene: string
  teaching: string
  /** その話題を持っている案の題 */
  from: string[]
}

export type Ground = {
  items: GroundItem[]
  /** ぜんぶに共通する話題 */
  shared: GroundTopic[]
  /** 半分以上にあるが、ぜんぶではない話題 */
  partial: GroundTopic[]
  /** ぜんぶに共通する気持ち */
  emotions: { id: EmotionId; label: string }[]
}

/** 一件ぶんの素材から、話題と気持ちを集める */
function tagsOf(m: NetaMaterials): { topics: TopicId[]; emotions: EmotionId[] } {
  const topics: TopicId[] = []
  const emotions: EmotionId[] = []
  const take = (x?: { topics?: TopicId[]; emotions?: EmotionId[] }) => {
    if (!x) return
    for (const t of x.topics ?? []) topics.push(t)
    for (const e of x.emotions ?? []) emotions.push(e)
  }
  take(m.conceptId ? CONCEPT_BY_ID[m.conceptId] : undefined)
  take(m.phraseId ? PHRASE_BY_ID[m.phraseId] : undefined)
  take(m.figureId ? FIGURE_BY_ID[m.figureId] : undefined)
  take(m.storyId ? STORY_BY_ID[m.storyId] : undefined)
  take(m.wordId ? WORD_BY_ID[m.wordId] : undefined)
  take(m.modernId ? MODERN_BY_ID[m.modernId] : undefined)
  return { topics: Array.from(new Set(topics)), emotions: Array.from(new Set(emotions)) }
}

export function groundOf(netas: Neta[]): Ground | null {
  if (netas.length < 2) return null

  const items: GroundItem[] = netas.map((n) => {
    const mats = n.sourceMaterials ?? [n.materials]
    const topics: TopicId[] = []
    const emotions: EmotionId[] = []
    for (const m of mats) {
      const g = tagsOf(m)
      topics.push(...g.topics)
      emotions.push(...g.emotions)
    }
    return {
      id: n.id,
      title: n.title,
      topics: Array.from(new Set(topics)),
      emotions: Array.from(new Set(emotions)),
    }
  })

  const build = (id: TopicId): GroundTopic | undefined => {
    const tp = TOPIC_BY_ID[id]
    if (!tp) return undefined
    return {
      id,
      label: tp.label,
      scene: tp.scene,
      teaching: tp.teaching,
      from: items.filter((x) => x.topics.includes(id)).map((x) => x.title),
    }
  }

  const allTopics = Array.from(new Set(items.flatMap((x) => x.topics)))
  const count = (id: TopicId) => items.filter((x) => x.topics.includes(id)).length
  // 多くにまたがっているものから。同数なら話題の並び順のまま
  const sortByCount = (a: TopicId, b: TopicId) => count(b) - count(a)

  const shared = allTopics
    .filter((id) => count(id) === items.length)
    .sort(sortByCount)
    .map(build)
    .filter((x): x is GroundTopic => x !== undefined)

  const partial = allTopics
    .filter((id) => count(id) >= 2 && count(id) < items.length)
    .sort(sortByCount)
    .map(build)
    .filter((x): x is GroundTopic => x !== undefined)

  const emotions = Array.from(new Set(items.flatMap((x) => x.emotions)))
    .filter((id) => items.every((x) => x.emotions.includes(id)))
    .map((id) => ({ id, label: EMOTION_BY_ID[id]?.label ?? id }))

  return { items, shared, partial, emotions }
}

/** 重なりを、そのまま持ち出せる形に */
export function groundSheet(g: Ground): string {
  const out: string[] = ['# えらんだ案の、重なっているところ', '']
  out.push('## えらんだもの')
  for (const it of g.items) out.push(`・${it.title}`)
  out.push('')
  if (g.shared.length > 0) {
    out.push('## ぜんぶに重なっている話題')
    for (const t of g.shared) {
      out.push(`### ${t.label}`)
      out.push(`この場面では：${t.scene}`)
      out.push(`この教えは：${t.teaching}`)
      out.push('')
    }
  }
  if (g.partial.length > 0) {
    out.push('## いくつかに重なっている話題')
    for (const t of g.partial) out.push(`・${t.label}（${t.from.join('／')}）`)
    out.push('')
  }
  if (g.emotions.length > 0) {
    out.push(`## ぜんぶに重なっている気持ち`)
    out.push(g.emotions.map((e) => e.label).join('／'))
    out.push('')
  }
  out.push('## ここから先は、ご自身の言葉で')
  out.push('・今日の話を、どの話題で通すか：［　］')
  out.push('・重なっているところを、どう言い当てるか：［　］')
  out.push('・聴いている方に、先に言ってしまうこと：［　］')
  return out.join('\n')
}
