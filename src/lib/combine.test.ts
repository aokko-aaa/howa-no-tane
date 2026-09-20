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

/** えらんだ案に出てくる仏教語の名前（重複を除く） */
const uniqTerms = (netas: typeof results) =>
  Array.from(
    new Set(
      netas
        .map((n) => CONCEPT_BY_ID[n.materials.conceptId!]?.term)
        .filter((x): x is string => Boolean(x)),
    ),
  )

describe('combineNetas', () => {
  it('1件以下では組み直さない', () => {
    expect(combineNetas([])).toBeNull()
    expect(combineNetas([results[0]])).toBeNull()
  })

  it('語るのは軸と受けの二語まで。残りは控えに回す', () => {
    const chosen = results.slice(0, 4)
    const out = combineNetas(chosen)!
    const spoken = out.sections.filter((s) => s.label.startsWith(SECTION.kotoba))
    expect(spoken.length).toBeLessThanOrEqual(2)
    // 語らなかった言葉は、素材としては消さず、演出メモに控えとして出す
    const memo = out.sections.find((s) => s.label === SECTION.memo)!
    const kept = new Set(out.sourceMaterials!.map((m) => m.conceptId))
    const allTerms = uniqTerms(chosen)
    const spokenText = spoken.map((s) => s.body).join('\n')
    for (const term of allTerms) {
      const inSpoken = spokenText.includes(term)
      expect(inSpoken || memo.body.includes(term), term).toBe(true)
    }
    for (const n of chosen) expect(kept, n.title).toContain(n.materials.conceptId)
  })

  it('軸から受けへ渡す一段がある（言葉が並んだだけにしない）', () => {
    const out = combineNetas(results.slice(0, 3))!
    const watashi = out.sections.find((s) => s.label === SECTION.watashi2)
    const spoken = out.sections.filter((s) => s.label.startsWith(SECTION.kotoba))
    // 二語語るなら、必ずそのあいだに渡しが入る
    if (spoken.length > 1) {
      expect(watashi, '渡しの一段').toBeTruthy()
      const labels = out.sections.map((s) => s.label)
      expect(labels.indexOf(SECTION.watashi2)).toBeGreaterThan(labels.indexOf(SECTION.kotoba))
      expect(labels.indexOf(SECTION.watashi2)).toBeLessThan(
        labels.indexOf(`${SECTION.kotoba}（もう一つ）`),
      )
    }
  })

  it('結びは軸の一語に戻る（二語とも持ち帰らせない）', () => {
    const out = combineNetas(results.slice(0, 3))!
    const jiku = CONCEPT_BY_ID[out.materials.conceptId!]
    const musubi = out.sections.find((s) => s.label === SECTION.musubi)!
    expect(musubi.body).toContain(jiku.term)
    expect(musubi.body).toContain('一語で十分')
  })

  it('語り手向けメモに、軸と、尺の落とし方が入る', () => {
    const out = combineNetas(results.slice(0, 3))!
    const memo = out.sections.find((s) => s.label === SECTION.memo)!
    const jiku = CONCEPT_BY_ID[out.materials.conceptId!]
    expect(memo.body).toContain(`軸は「${jiku.term}」`)
    expect(memo.body).toContain('尺が足りなければ')
  })

  it('通し原稿に、語り手向けメモが混ざらない', () => {
    const out = combineNetas(results.slice(0, 3))!
    expect(toProse(out)).not.toContain('声に出さない')
    expect(toProse(out)).not.toContain('軸は「')
  })

  it('自分で書いた一件があれば、それが入口になる', () => {
    const typed = '無くして探していた診察券を見つけた。探してもいない時にフッと出てきた'
    const own = generateNeta({ ...base, text: typed, emotions: ['yorokobi'], count: 3 })
    const out = combineNetas(own.slice(0, 2))!
    const iriguchi = out.sections.find((s) => s.label === SECTION.iriguchi)!
    expect(iriguchi.body).toContain('診察券')
    // 「ご自身の一件の場面に立てば」とは言わない
    expect(out.sections.map((s) => s.body).join('\n')).not.toContain('「ご自身の一件」の場面')
  })

  it('述語で終わる場面名を、助詞に直接つなげない', () => {
    // 「既読がつかないの場面」のような言い方にならないこと
    for (let i = 0; i + 2 < results.length; i++) {
      const out = combineNetas(results.slice(i, i + 2))!
      const body = out.sections.map((s) => s.body).join('\n')
      const scene = out.materials.modernScene
      if (scene) expect(body, scene).not.toContain(`${scene}の場`)
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
    expect(out.digest!.steps.join('\n')).toContain('自分の言葉')
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

  it('人の小ネタを含む案を重ねると、その人物も本文に残る', () => {
    const [hito] = generateNeta({ ...base, count: 1, pins: { angleId: 'hito' } })
    const out = combineNetas([hito, results[0]])!
    expect(out.materials.figureId).toBe(hito.materials.figureId)
  })
})
