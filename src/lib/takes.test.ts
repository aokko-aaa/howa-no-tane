import { describe, expect, it } from 'vitest'
import { CONCEPT_BY_ID } from '../data/concepts'
import { FIGURE_BY_ID } from '../data/figures'
import { MODERN_BY_ID } from '../data/modern'
import { PHRASE_BY_ID } from '../data/shinshu/phrases'
import { TAKES } from '../data/takes'
import { sourceById, takeNeta, takeOpenings, takesOf, takeSheet } from './situations'

describe('話の案', () => {
  it('idが重複していない', () => {
    expect(new Set(TAKES.map((t) => t.id)).size).toBe(TAKES.length)
  })

  it('どの案も、実在する言葉・一節・人物についている', () => {
    for (const t of TAKES) {
      const exists =
        t.ofKind === 'concept'
          ? CONCEPT_BY_ID[t.ofId]
          : t.ofKind === 'phrase'
            ? PHRASE_BY_ID[t.ofId]
            : FIGURE_BY_ID[t.ofId]
      expect(exists, `${t.id} → ${t.ofId}`).toBeTruthy()
    }
  })

  it('どの案にも、芯・入口・一歩が揃っている', () => {
    for (const t of TAKES) {
      // 芯が短すぎると話にならず、長すぎると自分の言葉に直しにくい
      expect(t.core.length, t.id).toBeGreaterThan(40)
      expect(t.core.length, t.id).toBeLessThan(220)
      expect(t.title.length, t.id).toBeGreaterThan(3)
      expect(t.openings.length, t.id).toBeGreaterThan(0)
      expect(t.step.length, t.id).toBeGreaterThan(5)
    }
  })

  it('入口に結んだ場面は、すべて実在する', () => {
    for (const t of TAKES) {
      for (const id of t.openingIds ?? []) {
        expect(MODERN_BY_ID[id], `${t.id} → ${id}`).toBeTruthy()
      }
    }
  })

  it('同じ言葉の案が、同じ題で並ばない', () => {
    const byOf = new Map<string, string[]>()
    for (const t of TAKES) {
      const key = `${t.ofKind}:${t.ofId}`
      byOf.set(key, [...(byOf.get(key) ?? []), t.title])
    }
    for (const [key, titles] of byOf) {
      expect(new Set(titles).size, key).toBe(titles.length)
    }
  })

  it('題が違っても、中身が同じ案を作らない', () => {
    expect(new Set(TAKES.map((t) => t.core)).size).toBe(TAKES.length)
    expect(new Set(TAKES.map((t) => t.step)).size).toBe(TAKES.length)
  })

  it('案のある言葉は、選ぶと案が出る', () => {
    const s = sourceById('concept', 'namuamidabutsu')!
    const takes = takesOf(s)
    expect(takes.length).toBe(5)
    expect(takes.map((t) => t.title)).toContain('お願いと、呼び声')
  })

  it('入口に場面を結んであれば、語り出しの一文が引ける', () => {
    const s = sourceById('concept', 'namuamidabutsu')!
    const t = takesOf(s).find((x) => x.id === 'namu-3')!
    const openings = takeOpenings(t)
    expect(openings.some((o) => o.line && o.line.length > 0)).toBe(true)
    // 同じ場面が二度出ない
    expect(new Set(openings.map((o) => o.label)).size).toBe(openings.length)
  })

  it('案の用紙は、最後のひと渡しを空けてある', () => {
    const s = sourceById('concept', 'namuamidabutsu')!
    const t = takesOf(s)[0]
    const sheet = takeSheet(s, t)
    expect(sheet).toContain(t.title)
    expect(sheet).toContain(t.core)
    expect(sheet).toContain(t.step)
    expect(sheet).toContain('ここから先は、ご自身の言葉で')
    expect(sheet).toContain('［　］')
  })

  it('案をネタ帳に入れると、典拠と注意も一緒に入る', () => {
    const s = sourceById('concept', 'namuamidabutsu')!
    const withSource = takesOf(s).find((x) => x.source)!
    const neta = takeNeta(s, withSource)
    expect(neta.sources.join('\n')).toContain(withSource.source!)
    const withCaution = takesOf(s).find((x) => x.caution)!
    expect(takeNeta(s, withCaution).cautions.join('\n')).toContain(withCaution.caution!)
  })

  it('案は、筋道や起承転結に組み直さない（素材をまたいで機械が書かない）', () => {
    const s = sourceById('concept', 'namuamidabutsu')!
    expect(takeNeta(s, takesOf(s)[0]).digest).toBeUndefined()
  })

  it('案の無い言葉でも落ちない', () => {
    const s = sourceById('concept', 'kissako')!
    expect(takesOf(s)).toEqual([])
  })
})
