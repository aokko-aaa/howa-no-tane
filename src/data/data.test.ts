import { describe, expect, it } from 'vitest'
import { ANGLES, SCENES } from './angles'
import { CONCEPTS } from './concepts'
import { EMOTIONS } from './emotions'
import { FIGURES } from './figures'
import { MODERNS } from './modern'
import { OCCASIONS } from './occasions'
import { REASONS, reasonsFor } from './reasons'
import { MANNERS } from './shinshu/manners'
import { PHRASES } from './shinshu/phrases'
import { STORIES } from './stories'
import { WORDS } from './words'

const emotionIds = new Set(EMOTIONS.map((e) => e.id))

const datasets = [
  { name: 'emotions', items: EMOTIONS as { id: string }[] },
  { name: 'concepts', items: CONCEPTS as { id: string }[] },
  { name: 'stories', items: STORIES as { id: string }[] },
  { name: 'words', items: WORDS as { id: string }[] },
  { name: 'moderns', items: MODERNS as { id: string }[] },
  { name: 'occasions', items: OCCASIONS as { id: string }[] },
  { name: 'figures', items: FIGURES as { id: string }[] },
  { name: 'phrases', items: PHRASES as { id: string }[] },
  { name: 'manners', items: MANNERS as { id: string }[] },
  { name: 'angles', items: ANGLES as { id: string }[] },
  { name: 'scenes', items: SCENES as { id: string }[] },
]

describe('データの整合', () => {
  it.each(datasets)('$name のidが重複していない', ({ items }) => {
    const ids = items.map((x) => x.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  const tagged = [
    { name: 'concepts', items: CONCEPTS },
    { name: 'stories', items: STORIES },
    { name: 'words', items: WORDS },
    { name: 'moderns', items: MODERNS },
    { name: 'figures', items: FIGURES },
  ]
  it.each(tagged)('$name の感情タグがすべて実在する', ({ items }) => {
    const unknown = items.flatMap((x) => x.emotions.filter((e) => !emotionIds.has(e)))
    expect(unknown).toEqual([])
  })

  it('すべての感情に、素材が最低一つずつ結びついている', () => {
    const covered = new Set(
      [...CONCEPTS, ...STORIES, ...WORDS, ...MODERNS, ...FIGURES].flatMap((x) => x.emotions),
    )
    const missing = EMOTIONS.map((e) => e.id).filter((id) => !covered.has(id))
    expect(missing).toEqual([])
  })

  it('どの感情でも、仏教語・喩え話・日常語がそれぞれ用意されている', () => {
    for (const e of EMOTIONS) {
      expect(CONCEPTS.some((c) => c.emotions.includes(e.id)), `concept: ${e.id}`).toBe(true)
      expect(STORIES.some((s) => s.emotions.includes(e.id)), `story: ${e.id}`).toBe(true)
      expect(WORDS.some((w) => w.emotions.includes(e.id)), `word: ${e.id}`).toBe(true)
      expect(MODERNS.some((m) => m.emotions.includes(e.id)), `modern: ${e.id}`).toBe(true)
    }
  })

  it('どの感情にも、人の小ネタが一つはある', () => {
    for (const e of EMOTIONS) {
      expect(FIGURES.some((f) => f.emotions.includes(e.id)), `figure: ${e.id}`).toBe(true)
    }
  })

  it('人の小ネタに、話と使いどころが揃っている', () => {
    for (const f of FIGURES) {
      expect(f.story.length, f.name).toBeGreaterThan(30)
      expect(f.hook.length, f.name).toBeGreaterThan(0)
      expect(f.era.length, f.name).toBeGreaterThan(0)
      expect(f.title.length, f.name).toBeGreaterThan(0)
    }
  })

  it('暮らしの品に結びつく人の小ネタが、いくつもある', () => {
    // 「身のまわりの出どころ」の切り口は、ここが薄いと成り立たない
    expect(FIGURES.filter((f) => f.everyday).length).toBeGreaterThanOrEqual(8)
  })

  it('お聖教の一句に、出典と意味と使いどころが揃っている', () => {
    for (const p of PHRASES) {
      expect(p.source.length, p.text).toBeGreaterThan(0)
      expect(p.gloss.length, p.text).toBeGreaterThan(0)
      expect(p.use.length, p.text).toBeGreaterThan(0)
      expect(p.emotions.every((e) => emotionIds.has(e)), p.text).toBe(true)
    }
  })

  it('御文と歎異抄の一句が、それぞれ複数ある', () => {
    expect(PHRASES.filter((p) => p.source.includes('御文')).length).toBeGreaterThanOrEqual(2)
    expect(PHRASES.filter((p) => p.source.includes('歎異抄')).length).toBeGreaterThanOrEqual(2)
  })

  it('言い回しの注意に、代わりの言い方と理由がある', () => {
    for (const m of MANNERS) {
      expect(m.use.length, m.avoid).toBeGreaterThan(0)
      expect(m.why.length, m.avoid).toBeGreaterThan(0)
    }
  })

  it('真宗の素材が、どの切り口にも回せるだけある', () => {
    expect(CONCEPTS.filter((c) => c.tradition === 'shinshu').length).toBeGreaterThanOrEqual(20)
    expect(STORIES.filter((x) => x.tradition === 'shinshu').length).toBeGreaterThanOrEqual(10)
    expect(WORDS.filter((x) => x.tradition === 'shinshu').length).toBeGreaterThanOrEqual(4)
  })

  it('どの月にも真宗の行事がある', () => {
    for (let m = 1; m <= 12; m++) {
      expect(
        OCCASIONS.some((o) => o.tradition === 'shinshu' && o.months.includes(m)),
        `month: ${m}`,
      ).toBe(true)
    }
  })

  it('どの月にも行事の素材がある', () => {
    for (let m = 1; m <= 12; m++) {
      expect(OCCASIONS.some((o) => o.months.includes(m)), `month: ${m}`).toBe(true)
    }
  })

  it('仏教語には出典と、世間の受け取り／ズレが揃っている', () => {
    for (const c of CONCEPTS) {
      expect(c.source.length, c.term).toBeGreaterThan(0)
      expect(c.misread.length, c.term).toBeGreaterThan(0)
      expect(c.pivot.length, c.term).toBeGreaterThan(0)
      expect(c.step.length, c.term).toBeGreaterThan(0)
    }
  })
})

describe('気持ちの一段下（なんで？）', () => {
  const conceptIds = new Set(CONCEPTS.map((c) => c.id))

  it('どの気持ちにも、掘る問いと選択肢がある', () => {
    for (const e of EMOTIONS) {
      expect(e.question.length, e.label).toBeGreaterThan(0)
      expect(reasonsFor(e.id).length, e.label).toBeGreaterThanOrEqual(3)
    }
  })

  it('理由のidが重複していない', () => {
    const ids = Object.values(REASONS).flat().map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('理由が指す気持ちと仏教語が、すべて実在する', () => {
    for (const r of Object.values(REASONS).flat()) {
      for (const e of r.emotions) expect(emotionIds.has(e), `${r.label} / ${e}`).toBe(true)
      for (const c of r.concepts ?? []) expect(conceptIds.has(c), `${r.label} / ${c}`).toBe(true)
    }
  })

  it('理由は、その気持ち自身を足し込まない（掘り下げにならないため）', () => {
    for (const [emotionId, list] of Object.entries(REASONS)) {
      for (const r of list) {
        expect(r.emotions, `${emotionId} / ${r.label}`).not.toContain(emotionId)
      }
    }
  })

  it('理由に紐づく仏教語は、その気持ちか理由の気持ちに当たっている', () => {
    for (const [emotionId, list] of Object.entries(REASONS)) {
      for (const r of list) {
        const tags = new Set([emotionId, ...r.emotions])
        for (const id of r.concepts ?? []) {
          const c = CONCEPTS.find((x) => x.id === id)!
          expect(
            c.emotions.some((e) => tags.has(e)),
            `${emotionId} / ${r.label} / ${c.term}`,
          ).toBe(true)
        }
      }
    }
  })
})

describe('気持ちごとの素材の厚み', () => {
  // 「うれしい」に言葉が4つしかなく、残りを無関係な言葉で埋めていたことへの歯止め。
  // どの気持ちを選んでも、6通り出すだけの素材があることを担保する。
  it.each(EMOTIONS.map((e) => ({ id: e.id, label: e.label })))(
    '$label に、十分な素材がある',
    ({ id }) => {
      const n = {
        概念: CONCEPTS.filter((x) => x.emotions.includes(id)).length,
        喩え: STORIES.filter((x) => x.emotions.includes(id)).length,
        日常語: WORDS.filter((x) => x.emotions.includes(id)).length,
        場面: MODERNS.filter((x) => x.emotions.includes(id)).length,
        一句: PHRASES.filter((x) => x.emotions.includes(id)).length,
      }
      expect(n.概念, `概念 ${n.概念}`).toBeGreaterThanOrEqual(7)
      expect(n.喩え, `喩え ${n.喩え}`).toBeGreaterThanOrEqual(3)
      expect(n.日常語, `日常語 ${n.日常語}`).toBeGreaterThanOrEqual(3)
      expect(n.場面, `場面 ${n.場面}`).toBeGreaterThanOrEqual(3)
      expect(n.一句, `一句 ${n.一句}`).toBeGreaterThanOrEqual(2)
    },
  )
})
