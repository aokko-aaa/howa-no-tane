import { describe, expect, it } from 'vitest'
import { wordOfTheDay } from './daily'
import { toStructured } from './format'
import { generateNeta, type GenerateInput } from './generate'
import { buildStructure, STRUCTURES } from './structure'

const base: GenerateInput = {
  text: '',
  emotions: ['iraira'],
  sceneId: 'howakai',
  month: 9,
  kojitsukeMax: 2,
  tradition: 'otani',
  seed: 3,
  count: 6,
}

describe('話の型に組み直す', () => {
  it('起承転結は、起・承・転・結の順に並ぶ', () => {
    for (const n of generateNeta(base)) {
      const out = buildStructure(n, 'kishou')
      expect(out.map((s) => s.label[0])).toEqual(['起', '承', '転', '結'])
      for (const s of out) {
        expect(s.body.trim().length, `${n.title} / ${s.label}`).toBeGreaterThan(0)
        expect(s.body).not.toMatch(/undefined|NaN/)
      }
    }
  })

  it('PREPは、結論から始まって結論に戻る', () => {
    for (const n of generateNeta(base)) {
      const out = buildStructure(n, 'prep')
      expect(out.map((s) => s.label)).toEqual([
        'P：言いたいこと',
        'R：なぜそう言えるのか',
        'E：たとえば',
        'P：もう一度',
      ])
      expect(out[0].body).toContain('申し上げたい')
      expect(out[3].body).toContain('ですから')
      // 結論で使う言葉は、冒頭で置いたものと同じ
      const term = out[0].body.match(/「(.+?)」といいます/)![1]
      expect(out[3].body).toContain(term)
    }
  })

  it('どの型でも、素材は変わらない', () => {
    const n = generateNeta({ ...base, count: 1 })[0]
    for (const st of STRUCTURES) {
      const text = buildStructure(n, st.id)
        .map((s) => s.body)
        .join('\n')
      // 選ばれた仏教語は、どの型でも本文に出てくる
      expect(text).toContain(n.digest!.steps.join('\n').match(/「(.+?)」という/)?.[1] ?? '')
    }
  })

  it('起承転結の「転」に、喩えや一句が入る', () => {
    const withStory = generateNeta({ ...base, count: 12 }).find((n) => n.materials.storyId)!
    const ten = buildStructure(withStory, 'kishou')[2].body
    expect(ten.length).toBeGreaterThan(40)
  })

  it('書き出しは、見出し・本文・出典の形になる', () => {
    const n = generateNeta({ ...base, count: 1 })[0]
    const text = toStructured(n, 'kishou')
    expect(text).toContain('【起（場面）】')
    expect(text).toContain('[出典]')
  })

  it('たどって出た話も、型に組み直せる', () => {
    const n = generateNeta({ ...base, sceneId: 'keijiban', count: 1 })[0]
    expect(buildStructure(n, 'prep')).toHaveLength(4)
  })
})

describe('今日の一つ', () => {
  it('同じ日なら同じ言葉、日が変われば変わる', () => {
    const a = wordOfTheDay(new Date('2026-09-20T00:00:00'))
    const b = wordOfTheDay(new Date('2026-09-20T23:00:00'))
    expect(a.id).toBe(b.id)
    const days = new Set(
      Array.from({ length: 30 }, (_, i) => wordOfTheDay(new Date(2026, 8, i + 1)).id),
    )
    expect(days.size).toBeGreaterThan(8)
  })
})
