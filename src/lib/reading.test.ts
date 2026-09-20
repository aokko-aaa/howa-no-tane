import { describe, expect, it } from 'vitest'
import { STEP1, STEP2, STEP3, type Shape } from '../data/paths'
import { buildReading, READING_SECTION } from './reading'

const shapes: Shape[] = ['kotoba', 'wake', 'shizuka', 'warai']

describe('たどって出す話', () => {
  it('どの組み合わせでも、読める形で返る', () => {
    for (const a of STEP1) {
      for (const b of STEP2) {
        for (const shape of shapes) {
          const r = buildReading({
            primary: a.emotions,
            secondary: b.emotions,
            shape,
            tradition: 'otani',
            seed: 1,
          })
          expect(r.sections.length, `${a.id}/${b.id}/${shape}`).toBeGreaterThanOrEqual(3)
          for (const sec of r.sections) {
            expect(sec.body.trim().length, `${a.id}/${shape} ${sec.label}`).toBeGreaterThan(0)
            expect(sec.body).not.toMatch(/undefined|NaN/)
          }
          expect(r.sources.length).toBeGreaterThan(0)
          expect(r.title.length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('一つ目に選んだ気持ちが、二つ目より強く効く', () => {
    // 「かなしい・会えない人がいる」→「家族のこと」で、子育ての場面が入口に来ない
    const r = buildReading({
      primary: ['wakare', 'shi'],
      secondary: ['kazoku', 'zaiakukan'],
      shape: 'kotoba',
      tradition: 'otani',
      seed: 1,
    })
    const kimochi = r.sections[0].body
    expect(kimochi).not.toContain('牛乳')
  })

  it('気持ちと、ことばは必ず入る', () => {
    const r = buildReading({ primary: ['kodoku'], secondary: [], shape: 'kotoba', tradition: 'otani', seed: 3 })
    const labels = r.sections.map((s) => s.label)
    expect(labels[0]).toBe(READING_SECTION.kimochi)
    expect(labels).toContain(READING_SECTION.kotoba)
  })

  it('「静かになりたい」では、今日できることを足さない', () => {
    const r = buildReading({ primary: ['tsukare'], secondary: [], shape: 'shizuka', tradition: 'otani', seed: 4 })
    expect(r.sections.map((s) => s.label)).not.toContain(READING_SECTION.kyou)
  })

  it('「笑いたい」では、日常語の出どころから入る', () => {
    const r = buildReading({ primary: ['iraira'], secondary: [], shape: 'warai', tradition: 'any', seed: 5 })
    expect(r.materials.wordId).toBeTruthy()
    expect(r.title).toContain('の出どころ')
  })

  it('「なぜか知りたい」では、世間の受け取りとのズレを出す', () => {
    const r = buildReading({ primary: ['jikokeno'], secondary: [], shape: 'wake', tradition: 'otani', seed: 6 })
    const body = r.sections.find((s) => s.label === READING_SECTION.mikata)!.body
    expect(body).toContain('世間では')
  })

  it('同じ入力と種なら同じ話、種が変われば別の話', () => {
    const a = buildReading({ primary: ['wakare'], secondary: [], shape: 'kotoba', tradition: 'otani', seed: 7 })
    const b = buildReading({ primary: ['wakare'], secondary: [], shape: 'kotoba', tradition: 'otani', seed: 7 })
    const c = buildReading({ primary: ['wakare'], secondary: [], shape: 'kotoba', tradition: 'otani', seed: 99 })
    expect(a).toEqual(b)
    expect(a.sections).not.toEqual(c.sections)
  })

  it('真宗モードでは真宗の言葉が出やすい', () => {
    const picks = [1, 2, 3, 4, 5, 6, 7, 8].map(
      (seed) => buildReading({ primary: ['wakare'], secondary: ['kazoku'], shape: 'kotoba', tradition: 'otani', seed }).tradition,
    )
    expect(picks.filter((t) => t === 'shinshu').length).toBeGreaterThanOrEqual(5)
  })

  it('チャートの選択肢に、仏教語をそのまま出していない', () => {
    const labels = [...STEP1, ...STEP2, ...STEP3].map((x) => x.label).join(' ')
    for (const term of ['無常', '縁起', '本願', '他力', '煩悩', '念仏']) {
      expect(labels.includes(term), term).toBe(false)
    }
  })
})
