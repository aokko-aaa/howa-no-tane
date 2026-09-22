import { CONCEPT_BY_ID, CONCEPTS } from '../data/concepts'
import { EMOTION_BY_ID } from '../data/emotions'
import { FIGURE_BY_ID, FIGURES } from '../data/figures'
import { MODERNS } from '../data/modern'
import { PHRASE_BY_ID, PHRASES } from '../data/shinshu/phrases'
import { TOPIC_BY_ID } from '../data/topics'
import type { EmotionId, Modern, Neta, TopicId } from '../data/types'
import { hashString } from './random'

/**
 * 話したいことから、いまの情景を引っ張り出す。
 *
 * ここでは文章を組み立てない。
 * 「この情景が、その言葉の近くにあります」と並べるところまでで止める。
 * 結びつけるのは語り手。だから、なぜ近いのか（重なっている話題と気持ち）を
 * 隠さずに出して、判断できるようにしてある。
 */

export type SourceKind = 'concept' | 'phrase' | 'figure'

export const SOURCE_LABEL: Record<SourceKind, string> = {
  concept: 'この言葉で話す',
  phrase: 'この一節で話す',
  figure: 'この人物の話をしたい',
}

export const SOURCE_KINDS: SourceKind[] = ['concept', 'phrase', 'figure']

/** 話したいこと。種類が違っても、同じ形で扱えるようにする */
export type Source = {
  kind: SourceKind
  id: string
  /** 見出し */
  title: string
  /** 読み・出典・時代など、見出しに添える一行 */
  sub: string
  /** そのものの中身（一行） */
  body: string
  /** 語り手向けの手がかり（問い・使いどころ・使いどころ） */
  hint: string
  topics: TopicId[]
  emotions: EmotionId[]
  /** 検索に使う文字列 */
  search: string
}

export function sourcesOf(kind: SourceKind): Source[] {
  if (kind === 'concept') {
    return CONCEPTS.map((c) => ({
      kind,
      id: c.id,
      title: c.term,
      sub: c.reading,
      body: c.oneLine,
      hint: `答えている問い：${c.question}`,
      topics: c.topics ?? [],
      emotions: c.emotions,
      search: [c.term, c.reading, c.oneLine, c.question, c.everyday, c.misread, c.pivot].join(' '),
    }))
  }
  if (kind === 'phrase') {
    return PHRASES.map((p) => ({
      kind,
      id: p.id,
      title: p.text,
      sub: p.source,
      body: p.gloss,
      hint: `使いどころ：${p.use}`,
      topics: p.topics ?? [],
      emotions: p.emotions,
      search: [p.text, p.reading ?? '', p.source, p.gloss, p.use].join(' '),
    }))
  }
  return FIGURES.map((f) => ({
    kind,
    id: f.id,
    title: f.name,
    sub: `${f.era}／${f.title}`,
    body: f.story,
    hint: `使いどころ：${f.hook}`,
    topics: f.topics ?? [],
    emotions: f.emotions,
    search: [f.name, f.era, f.title, f.story, f.hook, f.everyday ?? ''].join(' '),
  }))
}

export function sourceById(kind: SourceKind, id: string): Source | undefined {
  const exists =
    kind === 'concept'
      ? CONCEPT_BY_ID[id]
      : kind === 'phrase'
        ? PHRASE_BY_ID[id]
        : FIGURE_BY_ID[id]
  if (!exists) return undefined
  return sourcesOf(kind).find((s) => s.id === id)
}

/** なぜこの情景が並んでいるのか */
export type Situation = {
  modern: Modern
  sharedTopics: TopicId[]
  sharedEmotions: EmotionId[]
  score: number
}

/**
 * 話したいことに近い情景を並べる。
 * 話題の重なりを強く見る。気持ちは同じでも話題が違うと、別の話になるため。
 */
export function findSituations(source: Source, limit = 12): Situation[] {
  const topics = new Set(source.topics)
  const emotions = new Set(source.emotions)
  return MODERNS.map((modern) => {
    const sharedTopics = (modern.topics ?? []).filter((t) => topics.has(t))
    const sharedEmotions = modern.emotions.filter((e) => emotions.has(e))
    return {
      modern,
      sharedTopics,
      sharedEmotions,
      score: sharedTopics.length * 3 + sharedEmotions.length,
    }
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export const topicLabel = (id: TopicId) => TOPIC_BY_ID[id]?.label ?? id
export const emotionLabel = (id: EmotionId) => EMOTION_BY_ID[id]?.label ?? id

/**
 * ネタ帳に入れるための形。
 * 器は Neta と同じにして、保存・メモ・評価・書き出しを共用する。
 * ただし digest は持たせない。筋道や起承転結に組み直すと、
 * 素材をまたいで機械が文章を作ることになり、ここで避けたかったことに戻る。
 */
export function situationNeta(source: Source, sit: Situation): Neta {
  const m = sit.modern
  const kasanari = Array.from(
    new Set([...sit.sharedTopics.map(topicLabel), ...sit.sharedEmotions.map(emotionLabel)]),
  ).join('／')
  return {
    id: `sit-${source.kind}-${source.id}-${m.id}-${hashString(source.title + m.scene)}`,
    angleId: 'situation',
    angleName: '話したいことから',
    aim: '話したいことに、いまの情景を結びつける',
    kojitsuke: 1,
    title: `${source.title}／${m.scene}`,
    sections: [
      { label: '話したいこと', body: `${source.title}${source.sub ? `（${source.sub}）` : ''}\n${source.body}\n${source.hint}` },
      { label: '情景', body: m.scene },
      { label: '語り出し', body: m.line },
      { label: 'そこで思っていること', body: m.omoi },
      { label: '重なっているところ', body: kasanari || '—' },
      {
        label: 'つなぎ目（ご自身の言葉で）',
        body: '・この情景のどこを、その言葉へ渡すか：［　］\n・聴いている人に、先に言ってしまうこと：［　］\n・今日の一歩：［　］',
      },
    ],
    sources: sourceCitation(source),
    cautions: sourceCaution(source),
    materials: {
      conceptId: source.kind === 'concept' ? source.id : undefined,
      phraseId: source.kind === 'phrase' ? source.id : undefined,
      figureId: source.kind === 'figure' ? source.id : undefined,
      modernId: m.id,
      modernScene: m.scene,
      modernLine: m.line,
    },
    minutes: 0,
    tradition:
      (source.kind === 'concept' ? CONCEPT_BY_ID[source.id]?.tradition : undefined) ??
      (source.kind === 'figure' ? FIGURE_BY_ID[source.id]?.tradition : undefined) ??
      'common',
  }
}

function sourceCitation(source: Source): string[] {
  if (source.kind === 'concept') {
    const c = CONCEPT_BY_ID[source.id]
    return c ? [`${c.term}：${c.source}`] : []
  }
  if (source.kind === 'phrase') {
    const p = PHRASE_BY_ID[source.id]
    return p ? [`一節：${p.source}`] : []
  }
  const f = FIGURE_BY_ID[source.id]
  return f ? [`${f.name}：${f.era}`] : []
}

function sourceCaution(source: Source): string[] {
  const c =
    source.kind === 'concept'
      ? CONCEPT_BY_ID[source.id]?.caution
      : source.kind === 'phrase'
        ? PHRASE_BY_ID[source.id]?.caution
        : FIGURE_BY_ID[source.id]?.caution
  return c ? [`${source.title}：${c}`] : []
}

/**
 * 下ごしらえの用紙。
 * 両側を並べて、つなぎ目は［　］のまま渡す。機械は結論を書かない。
 */
export function toWorksheet(source: Source, sit: Situation): string {
  const m = sit.modern
  // 話題と気持ちで同じ名前になることがあるので、重複は落とす
  const kasanari = Array.from(
    new Set([...sit.sharedTopics.map(topicLabel), ...sit.sharedEmotions.map(emotionLabel)]),
  ).join('／')
  return [
    `■ 話したいこと：${source.title}${source.sub ? `（${source.sub}）` : ''}`,
    source.body,
    source.hint,
    '',
    `■ 情景：${m.scene}`,
    `語り出し：${m.line}`,
    `そこで思っていること：${m.omoi}`,
    '',
    `■ 重なっているところ：${kasanari || '—'}`,
    '',
    '── ここから先は、ご自身の言葉で ──',
    '・この情景のどこを、その言葉へ渡すか：［　］',
    '・聴いている人に、先に言ってしまうこと：［　］',
    '・今日の一歩：［　］',
    '',
  ].join('\n')
}
