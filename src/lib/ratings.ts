import { ANGLE_BY_ID, SCENE_BY_ID } from '../data/angles'
import { EMOTION_BY_ID } from '../data/emotions'
import { REASON_BY_ID } from '../data/reasons'
import { CONCEPT_BY_ID } from '../data/concepts'
import { FIGURE_BY_ID } from '../data/figures'
import { PHRASE_BY_ID } from '../data/shinshu/phrases'
import { STORY_BY_ID } from '../data/stories'
import type { Neta } from '../data/types'
import { WORD_BY_ID } from '../data/words'

/**
 * 案の良し悪しを、その場で残しておくための帳面。
 *
 * アプリはこれで学習しない。端末の中に溜めて、書き出して、
 * 人が読んで直すためのもの。
 *
 * ◎△だけでは「何を直せばいいか」が分からないので、
 * どの素材でできていた案なのかを、そのとき一緒に写し取っておく。
 * あとから案を復元できなくても、素材の名前が残っていれば直せる。
 */

const KEY = 'howa-app/ratings/v1'

export type Verdict = 'good' | 'off'

/** △のとき、どこが合わなかったか */
export type Where = 'kotoba' | 'toi' | 'tatoe' | 'iriguchi' | 'zentai'

export const WHERE_LABEL: Record<Where, string> = {
  kotoba: '言葉',
  toi: '問い',
  tatoe: 'たとえ',
  iriguchi: '入口',
  zentai: '全体',
}

export const WHERE_ORDER: Where[] = ['kotoba', 'toi', 'tatoe', 'iriguchi', 'zentai']

/** その案が何でできていたか。直すときに要るのはここ */
export type Snapshot = {
  title: string
  angleId: string
  angleName: string
  conceptId?: string
  conceptTerm?: string
  question?: string
  scale?: 1 | 2 | 3
  storyId?: string
  storyTitle?: string
  storyKind?: string
  figureId?: string
  figureName?: string
  wordId?: string
  word?: string
  phraseId?: string
  phrase?: string
  modernId?: string
  modernScene?: string
  minutes: number
  tradition: string
}

/** どんな条件で出た案か */
export type Context = {
  text: string
  emotions: string[]
  reasons: string[]
  sceneId: string
  tradition: string
  scale: string
}

export type Rating = {
  netaId: string
  verdict: Verdict
  where: Where[]
  memo: string
  at: string
  snapshot: Snapshot
  context: Context
}

export function snapshotOf(neta: Neta): Snapshot {
  const m = neta.materials
  const c = m.conceptId ? CONCEPT_BY_ID[m.conceptId] : undefined
  const st = m.storyId ? STORY_BY_ID[m.storyId] : undefined
  const f = m.figureId ? FIGURE_BY_ID[m.figureId] : undefined
  const w = m.wordId ? WORD_BY_ID[m.wordId] : undefined
  const ph = m.phraseId ? PHRASE_BY_ID[m.phraseId] : undefined
  return {
    title: neta.title,
    angleId: neta.angleId,
    angleName: ANGLE_BY_ID[neta.angleId]?.name ?? neta.angleName,
    conceptId: c?.id,
    conceptTerm: c?.term,
    question: c?.question,
    scale: c?.scale,
    storyId: st?.id,
    storyTitle: st?.title,
    storyKind: st?.kind,
    figureId: f?.id,
    figureName: f?.name,
    wordId: w?.id,
    word: w?.word,
    phraseId: ph?.id,
    phrase: ph?.text,
    modernId: m.modernId,
    modernScene: m.modernScene,
    minutes: neta.minutes,
    tradition: neta.tradition,
  }
}

function read(): Rating[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Rating[]) : []
  } catch {
    return []
  }
}

function write(list: Rating[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    // 容量オーバーやプライベートモードでは黙って諦める（生成は続けられる）
  }
}

export const ratingStore = {
  list: read,
  /** 同じ案は上書きする（押し直せる） */
  set(r: Rating): Rating[] {
    const next = [r, ...read().filter((x) => x.netaId !== r.netaId)]
    write(next)
    return next
  },
  remove(netaId: string): Rating[] {
    const next = read().filter((x) => x.netaId !== netaId)
    write(next)
    return next
  },
  clear(): Rating[] {
    write([])
    return []
  },
}

/** 素材ごとに、◎と△を数える（どこを直すかの当たりをつけるため） */
export function tally(list: Rating[]): { kind: string; name: string; good: number; off: number }[] {
  const map = new Map<string, { kind: string; name: string; good: number; off: number }>()
  const add = (kind: string, name: string | undefined, v: Verdict) => {
    if (!name) return
    const key = `${kind}:${name}`
    const cur = map.get(key) ?? { kind, name, good: 0, off: 0 }
    cur[v === 'good' ? 'good' : 'off']++
    map.set(key, cur)
  }
  for (const r of list) {
    add('仏教語', r.snapshot.conceptTerm, r.verdict)
    add('切り口', r.snapshot.angleName, r.verdict)
    add('たとえ', r.snapshot.storyTitle, r.verdict)
    add('人物', r.snapshot.figureName, r.verdict)
    add('日常語', r.snapshot.word, r.verdict)
    add('入口', r.snapshot.modernScene, r.verdict)
  }
  // △が多いものから。同数なら数の多いほうから
  return [...map.values()].sort((a, b) => b.off - a.off || b.good + b.off - (a.good + a.off))
}

const line = (label: string, v: string | undefined) => (v ? `${label}：${v}` : '')

// 読むのは人なので、idではなく名前で出す
const emotionNames = (ids: string[]) =>
  ids.map((id) => EMOTION_BY_ID[id]?.label ?? id).join('・')
const reasonNames = (ids: string[]) => ids.map((id) => REASON_BY_ID[id]?.label ?? id).join('・')
const sceneName = (id: string) => SCENE_BY_ID[id]?.label ?? id
const TRADITION_NAME: Record<string, string> = { otani: '真宗大谷派を優先', any: '宗派を問わない' }
const SCALE_NAME: Record<string, string> = {
  auto: 'おまかせ',
  kurashi: '暮らしの寸法で',
  inochi: 'いのちの話で',
}

/** 貼って渡せる形に書き出す */
export function toRatingsMarkdown(list: Rating[]): string {
  if (list.length === 0) return '# 法話の種／評価\n\nまだ評価がありません。\n'
  const off = list.filter((x) => x.verdict === 'off')
  const good = list.filter((x) => x.verdict === 'good')

  const one = (r: Rating) => {
    const s = r.snapshot
    const head = `### ${s.title}`
    const where =
      r.where.length > 0
        ? `合わなかったところ：${r.where.map((w) => WHERE_LABEL[w]).join('・')}`
        : undefined
    const memo = r.memo.trim() ? `> ${r.memo.trim()}` : undefined
    const mats = [
      line('切り口', s.angleName),
      line('仏教語', s.conceptTerm ? `${s.conceptTerm}（大きさ${s.scale ?? '—'}）` : undefined),
      line('問い', s.question),
      line('たとえ', s.storyTitle ? `${s.storyTitle}（${s.storyKind}）` : undefined),
      line('人物', s.figureName),
      line('日常語', s.word),
      line('一句', s.phrase),
      line('入口', s.modernScene),
    ].filter(Boolean)
    const ctx = [
      line('書いた文', r.context.text.trim() || undefined),
      line('気持ち', emotionNames(r.context.emotions) || undefined),
      line('なんで？', reasonNames(r.context.reasons) || undefined),
      line('場面', r.context.sceneId ? sceneName(r.context.sceneId) : undefined),
      line('教え', TRADITION_NAME[r.context.tradition] ?? r.context.tradition),
      line('話の大きさ', SCALE_NAME[r.context.scale] ?? (r.context.scale || undefined)),
    ].filter(Boolean)
    return [
      head,
      ...(where ? [where] : []),
      ...(memo ? [memo] : []),
      mats.map((x) => `- ${x}`).join('\n'),
      ctx.map((x) => `- ${x}`).join('\n'),
    ].join('\n\n')
  }

  const counts = tally(list).filter((x) => x.off > 0)
  const table =
    counts.length > 0
      ? [
          '## △が出た素材',
          ['| | 素材 | ◎ | △ |', '| --- | --- | --- | --- |']
            .concat(
              counts.slice(0, 20).map((x) => `| ${x.kind} | ${x.name} | ${x.good} | ${x.off} |`),
            )
            .join('\n'),
        ]
      : []

  return `${[
    '# 法話の種／評価',
    `評価 ${list.length}件（◎ ${good.length} ／ △ ${off.length}）`,
    'これはアプリの学習用ではありません。読んで直すための記録です。',
    ...table,
    ...(off.length > 0 ? [`## △ ちがう（${off.length}件）`, off.map(one).join('\n\n')] : []),
    ...(good.length > 0 ? [`## ◎ 使える（${good.length}件）`, good.map(one).join('\n\n')] : []),
  ].join('\n\n')}\n`
}
