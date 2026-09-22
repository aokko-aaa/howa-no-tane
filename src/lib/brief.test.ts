import { describe, expect, it } from 'vitest'
import { CONCEPT_BY_ID } from '../data/concepts'
import { BRIEF_FORMS, DEFAULT_BRIEF, toAIBrief } from './brief'
import { generateNeta, type GenerateInput } from './generate'
import { findSituations, situationNeta, sourceById } from './situations'
import type { SavedNeta } from './storage'

const base: GenerateInput = {
  text: '同じことを三度聞かれて、つい強い声が出た',
  emotions: ['iraira'],
  sceneId: 'howakai',
  month: 9,
  kojitsukeMax: 2,
  tradition: 'otani',
  seed: 5,
  count: 3,
}

const saved = (neta: SavedNeta['neta'], memo = ''): SavedNeta => ({
  neta,
  memo,
  savedAt: '2026-09-22T01:00:00.000Z',
  fromEmotions: ['iraira'],
  fromText: base.text,
})

const src = sourceById('concept', 'mukudoku')!
const sitNeta = situationNeta(src, findSituations(src)[0])

describe('AIに渡す指示書', () => {
  it('素材が無くても壊れない', () => {
    expect(toAIBrief([])).toContain('素材がありません')
  })

  it('作り話をさせないための縛りが必ず入る', () => {
    // 仏教の素材をAIに渡すと、もっともらしい出典や逸話をこしらえる。
    // ここが抜けると、この機能はかえって危ない。
    for (const form of BRIEF_FORMS) {
      const md = toAIBrief([saved(generateNeta(base)[0])], { ...DEFAULT_BRIEF, form: form.id })
      expect(md, form.id).toContain('出典は、下に書かれているものだけを使う')
      expect(md, form.id).toContain('書かれていない事実（年号・人物・逸話・引用）を作らない')
      expect(md, form.id).toContain('確かめてほしいところ')
    }
  })

  it('選んだ組み立てと長さが指示に出る', () => {
    const n = [saved(generateNeta(base)[0])]
    expect(toAIBrief(n, { ...DEFAULT_BRIEF, form: 'toi' })).toContain('② 問い')
    expect(toAIBrief(n, { ...DEFAULT_BRIEF, form: 'kishou' })).toContain('転 — 仏教から見るとどうか')
    expect(toAIBrief(n, { ...DEFAULT_BRIEF, form: 'omakase' })).toContain('素材に合う形で')
    expect(toAIBrief(n, { ...DEFAULT_BRIEF, minutes: 10 })).toContain('約10分')
    expect(toAIBrief(n, { ...DEFAULT_BRIEF, minutes: 0 })).toContain('掲示板やSNS')
  })

  it('大谷派の作法は、切ったら指示から消える', () => {
    const n = [saved(generateNeta(base)[0])]
    expect(toAIBrief(n, { ...DEFAULT_BRIEF, otani: true })).toContain('ご冥福')
    expect(toAIBrief(n, { ...DEFAULT_BRIEF, otani: false })).not.toContain('ご冥福')
  })

  it('素材の中身が、idではなく言葉で出る', () => {
    const neta = generateNeta(base)[0]
    const md = toAIBrief([saved(neta)])
    const c = CONCEPT_BY_ID[neta.materials.conceptId!]
    expect(md).toContain(c.term)
    expect(md).toContain(c.question)
    expect(md).toContain(c.pivot)
    expect(md).toContain(c.source)
    expect(md).not.toMatch(/conceptId|modernId|storyId/)
  })

  it('語り手のメモが、いちばん大事なものとして入る', () => {
    const md = toAIBrief([saved(generateNeta(base)[0], '護持会の役員さんに')])
    expect(md).toContain('いちばん大事')
    expect(md).toContain('護持会の役員さんに')
  })

  it('メモが空なら、その欄は出さない', () => {
    expect(toAIBrief([saved(generateNeta(base)[0], '')])).not.toContain('語り手のメモ')
  })

  it('語り手向けの演出メモは渡さない（AIが読むものではない）', () => {
    const md = toAIBrief([saved(generateNeta(base)[0])])
    expect(md).not.toContain('声に出さない')
  })

  it('話したいことから入れた一件も、そのまま渡せる', () => {
    const md = toAIBrief([saved(sitNeta)])
    expect(md).toContain(src.title)
    expect(md).toContain('そこで人が思っていること')
    expect(md).toContain('引用してよいのはこの範囲だけ')
  })

  it('複数件なら、一本にまとめるよう指示する', () => {
    const md = toAIBrief([saved(generateNeta(base)[0]), saved(sitNeta)])
    expect(md).toContain('一本にまとめる')
    expect(md).toContain('軸になる一つを決めて')
    expect(md).toContain('素材1：')
    expect(md).toContain('素材2：')
  })

  it('一件だけなら、まとめる指示は出さない', () => {
    expect(toAIBrief([saved(generateNeta(base)[0])])).not.toContain('一本にまとめる')
  })

  it('注意書きのある素材は、注意も一緒に渡す', () => {
    const withCaution = generateNeta({ ...base, count: 12 }).find((n) => n.cautions.length > 0)!
    const md = toAIBrief([saved(withCaution)])
    expect(md).toContain('語る前に確認')
    expect(md).toContain(withCaution.cautions[0])
  })
})
