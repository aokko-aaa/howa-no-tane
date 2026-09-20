import { CONCEPTS } from '../data/concepts'
import { MODERNS } from '../data/modern'
import type { Shape } from '../data/paths'
import { PHRASES } from '../data/shinshu/phrases'
import { STORIES } from '../data/stories'
import { WORDS } from '../data/words'
import type { EmotionId, Neta, NetaSection, Tradition, TraditionMode } from '../data/types'
import type { Ranked } from './match'
import { hashString, mulberry32, type Rand } from './random'

// 「たどる」の出力。法話の下書きではなく、そのまま読める読み物にする。
// 器は Neta と同じにして、ネタ帳への保存とコピーを共用する。

export const READING_SECTION = {
  kimochi: 'そのきもち',
  mikata: 'むかしの人は、こう見ました',
  hanashi: 'ひとつの話',
  kyou: '今日、できること',
  kotoba: 'ことば',
} as const

export type ReadingInput = {
  /** 一つ目に選んだ「きもち」。いちばん強く効かせる */
  primary: EmotionId[]
  /** 二つ目に選んだ「ことがら」 */
  secondary: EmotionId[]
  shape: Shape
  tradition: TraditionMode
  seed: number
}

const s = (label: string, body: string): NetaSection => ({ label, body })
const nq = (t: string) => t.replace(/。$/, '')

function top<T>(ranked: Ranked<T>[], rand: Rand, window = 5): T {
  const positive = ranked.filter((r) => r.score > 0)
  const pool = (positive.length >= 3 ? positive : ranked).slice(0, window)
  return pool[Math.floor(rand() * pool.length) % pool.length].item
}

const SHAPE_NOTE: Record<Shape, string> = {
  kotoba: '気持ちに名前をつける',
  wake: '仕組みとして見る',
  shizuka: '短く、ひとつだけ',
  warai: '言葉の出どころから',
}

export function buildReading(input: ReadingInput): Neta {
  const rand = mulberry32(
    input.seed ^ hashString([...input.primary, ...input.secondary].join(',') + input.shape),
  )
  const bonus = input.tradition === 'otani' ? 6 : 0
  const P = new Set(input.primary)
  const S = new Set(input.secondary)

  // 一つ目の「きもち」を強く、二つ目の「ことがら」を弱く効かせる。
  // 両方を同じ重みにすると、悲しみの相談に子育ての場面が出る、といったズレが起きる。
  const fit = (tags: readonly EmotionId[]) =>
    tags.filter((t) => P.has(t)).length * 5 + tags.filter((t) => S.has(t)).length * 2

  const rank = <T extends { emotions: readonly EmotionId[]; tradition?: Tradition }>(
    items: readonly T[],
  ): Ranked<T>[] =>
    items
      .map((item) => ({
        item,
        score:
          fit(item.emotions) +
          (item.tradition === 'shinshu' ? bonus : item.tradition === 'zen' ? -1 : 0),
      }))
      .sort((a, b) => b.score - a.score)

  const concept = top(rank(CONCEPTS), rand)
  const tags = new Set(concept.emotions)
  const align = <T extends { emotions: readonly EmotionId[] }>(ranked: Ranked<T>[]) =>
    ranked
      .map((r) => ({ item: r.item, score: r.score + r.item.emotions.filter((e) => tags.has(e)).length * 3 }))
      .sort((a, b) => b.score - a.score)

  const modern = top(align(rank(MODERNS)), rand, 6)
  const story = top(align(rank(STORIES)), rand)
  const word = top(align(rank(WORDS)), rand)
  const phrase = top(align(rank(PHRASES)), rand)

  const sections: NetaSection[] = []
  const sources: string[] = []
  const cautions: string[] = []

  sections.push(s(READING_SECTION.kimochi, modern.line))

  if (input.shape === 'warai') {
    sections.push(
      s(
        READING_SECTION.mikata,
        `「${word.word}」という言葉があります。いまは${nq(word.now)}という意味ですが、もとは仏教の言葉で、${word.origin}`,
      ),
    )
    sources.push(`${word.word}：仏教語（${word.origin}）`)
    if (word.caution) cautions.push(`${word.word}：${word.caution}`)
  } else {
    sections.push(
      s(
        READING_SECTION.mikata,
        input.shape === 'wake'
          ? `仏教には「${concept.term}」という言葉があります。${concept.oneLine}　世間では${nq(concept.misread)}と受け取られがちですが、${concept.pivot}`
          : `仏教には「${concept.term}」という言葉があります。${concept.oneLine}　${concept.everyday}`,
      ),
    )
  }
  sources.push(`${concept.term}：${concept.source}`)
  if (concept.caution) cautions.push(`${concept.term}：${concept.caution}`)

  if (input.shape !== 'wake') {
    sections.push(s(READING_SECTION.hanashi, `${story.title}。${story.summary}`))
    sources.push(`${story.title}：${story.source}`)
    if (story.caution) cautions.push(`${story.title}：${story.caution}`)
  }

  if (input.shape !== 'shizuka') {
    sections.push(s(READING_SECTION.kyou, concept.step))
  }

  sections.push(s(READING_SECTION.kotoba, `${phrase.text}\n——${phrase.source}\n\n${phrase.gloss}`))
  sources.push(`一句：${phrase.source}`)
  if (phrase.caution) cautions.push(`一句：${phrase.caution}`)

  const tradition: Tradition = concept.tradition ?? 'common'

  return {
    id: `reading-${input.seed}-${input.shape}`,
    angleId: 'tadoru',
    angleName: 'たどって出た話',
    aim: SHAPE_NOTE[input.shape],
    kojitsuke: 1,
    title: input.shape === 'warai' ? `「${word.word}」の出どころ` : concept.oneLine,
    sections,
    sources,
    cautions,
    materials: {
      conceptId: concept.id,
      storyId: input.shape !== 'wake' ? story.id : undefined,
      wordId: input.shape === 'warai' ? word.id : undefined,
      modernId: modern.id,
      phraseId: phrase.id,
    },
    minutes: 0,
    tradition,
  }
}
