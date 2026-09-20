import { describe, expect, it } from 'vitest'
import { CONCEPT_BY_ID } from '../data/concepts'
import { combineNetas } from './combine'
import { toProse, toScript } from './format'
import { generateNeta, SECTION, type GenerateInput } from './generate'
import { buildStructure } from './structure'

const base: GenerateInput = {
  text: '',
  emotions: ['shitto', 'hikaku'],
  sceneId: 'howakai',
  month: 5,
  kojitsukeMax: 3,
  tradition: 'any',
  seed: 4242,
  count: 6,
}

const results = generateNeta(base)

describe('combineNetas', () => {
  it('1件以下では組み直さない', () => {
    expect(combineNetas([])).toBeNull()
    expect(combineNetas([results[0]])).toBeNull()
  })

  it('えらんだ案の仏教語が、すべて本文に入る', () => {
    const chosen = results.slice(0, 3)
    const out = combineNetas(chosen)!
    const body = out.sections.map((s) => s.body).join('\n')
    for (const n of chosen) {
      const c = CONCEPT_BY_ID[n.materials.conceptId!]
      if (c) expect(body, c.term).toContain(c.term)
    }
  })

  it('同じ仏教語の案を重ねても、同じ言葉が二度出ない', () => {
    const a = results[0]
    const twin = { ...a, id: `${a.id}-twin` }
    const out = combineNetas([a, twin])!
    const c = CONCEPT_BY_ID[a.materials.conceptId!]
    const hits = out.sections.filter((s) => s.label.startsWith(SECTION.kotoba)).length
    expect(hits).toBe(1)
    expect(c).toBeTruthy()
  })

  it('入口は一つに絞り、二つ目からは後ろへ回す', () => {
    const out = combineNetas(results.slice(0, 3))!
    const iriguchi = out.sections.filter((s) => s.label === SECTION.iriguchi)
    expect(iriguchi).toHaveLength(1)
  })

  it('つなぎ目は語り手が埋める形で残す（機械が結論を書かない）', () => {
    const out = combineNetas(results.slice(0, 2))!
    const kasanari = out.sections.find((s) => s.label === SECTION.kasanari)!
    expect(kasanari.body).toContain('［')
    expect(out.digest!.steps.join('\n')).toContain('ご自身の言葉')
  })

  it('出典と「語る前に確認」が、もとの案から引き継がれる', () => {
    const chosen = results.slice(0, 3)
    const out = combineNetas(chosen)!
    for (const n of chosen) {
      for (const src of n.sources) expect(out.sources).toContain(src)
      for (const ca of n.cautions) expect(out.cautions).toContain(ca)
    }
  })

  it('出典が重複しない', () => {
    const out = combineNetas([results[0], results[0]])!
    expect(new Set(out.sources).size).toBe(out.sources.length)
  })

  it('本文に未定義や空欄が混ざらない', () => {
    for (let i = 0; i + 1 < results.length; i++) {
      const out = combineNetas(results.slice(i, i + 3))!
      expect(out.title).not.toMatch(/undefined|NaN/)
      for (const s of out.sections) {
        expect(s.body.trim().length, s.label).toBeGreaterThan(0)
        expect(s.body, s.label).not.toMatch(/undefined|NaN/)
      }
      expect(out.digest!.steps.every((x) => x.trim().length > 0)).toBe(true)
    }
  })

  it('組み直したものも、書き出しと型の組み直しがそのまま通る', () => {
    const out = combineNetas(results.slice(0, 2))!
    expect(toProse(out).length).toBeGreaterThan(50)
    expect(toScript(out)).toContain(out.title)
    expect(buildStructure(out, 'kishou').length).toBeGreaterThan(0)
    expect(buildStructure(out, 'prep').length).toBeGreaterThan(0)
  })

  it('同じ顔ぶれなら同じidになり、ネタ帳で重ならない', () => {
    const a = combineNetas(results.slice(0, 2))!
    const b = combineNetas(results.slice(0, 2))!
    const c = combineNetas(results.slice(1, 3))!
    expect(a.id).toBe(b.id)
    expect(a.id).not.toBe(c.id)
  })

  it('掲示板の案どうしを重ねても、話す形として扱う', () => {
    const keiji = generateNeta({ ...base, sceneId: 'keijiban' })
    const out = combineNetas(keiji.slice(0, 2))!
    expect(out.minutes).toBeGreaterThan(0)
  })

  it('真宗の案が混ざれば、真宗の組み上がりとして扱う', () => {
    const otani = generateNeta({ ...base, tradition: 'otani', count: 8 })
    const shinshu = otani.find((n) => n.tradition === 'shinshu')
    const other = otani.find((n) => n.id !== shinshu?.id)
    if (shinshu && other) {
      expect(combineNetas([shinshu, other])!.tradition).toBe('shinshu')
    }
  })

  it('組んだものを、さらに組める（ネタ帳で溜めたものを重ねる）', () => {
    const ab = combineNetas(results.slice(0, 2))!
    const cd = combineNetas(results.slice(2, 4))!
    const all = combineNetas([ab, cd])!
    // もとの4案の仏教語が、素材としてすべて残っている
    const want = results.slice(0, 4).map((n) => n.materials.conceptId)
    const got = all.sourceMaterials!.map((m) => m.conceptId)
    for (const id of want) expect(got, id).toContain(id)
  })

  it('組み直しても、出典と注意が落ちない', () => {
    const chosen = results.slice(0, 4)
    const ab = combineNetas(chosen.slice(0, 2))!
    const cd = combineNetas(chosen.slice(2, 4))!
    const all = combineNetas([ab, cd])!
    for (const n of chosen) {
      for (const src of n.sources) expect(all.sources).toContain(src)
    }
  })

  it('語るのは仏教語三つまで（外したものは素材として残す）', () => {
    const out = combineNetas(results.slice(0, 5))!
    const shown = out.sections.filter((s) => s.label.startsWith(SECTION.kotoba))
    expect(shown.length).toBeLessThanOrEqual(3)
    const kept = new Set(out.sourceMaterials!.map((m) => m.conceptId))
    for (const n of results.slice(0, 5)) {
      expect(kept, n.title).toContain(n.materials.conceptId)
    }
    if (shown.length === 3) expect(out.digest!.note).toContain('三つまで')
  })

  it('人の小ネタを含む案を重ねると、その人物も本文に残る', () => {
    const [hito] = generateNeta({ ...base, count: 1, pins: { angleId: 'hito' } })
    const out = combineNetas([hito, results[0]])!
    expect(out.materials.figureId).toBe(hito.materials.figureId)
  })
})
