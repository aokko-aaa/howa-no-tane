import { describe, expect, it } from 'vitest'
import { generateNeta, type GenerateInput } from './generate'
import { snapshotOf, tally, toRatingsMarkdown, WHERE_LABEL, type Rating } from './ratings'

const base: GenerateInput = {
  text: '家事子育てに追われて自分とは何かがわからなくなる',
  emotions: ['fuan'],
  sceneId: 'howakai',
  month: 9,
  kojitsukeMax: 2,
  tradition: 'otani',
  seed: 3,
  count: 6,
}
const netas = generateNeta(base)

const rating = (i: number, verdict: Rating['verdict'], extra: Partial<Rating> = {}): Rating => ({
  netaId: netas[i].id,
  verdict,
  where: verdict === 'off' ? ['kotoba'] : [],
  memo: verdict === 'off' ? '問いが硬い' : '',
  at: '2026-09-22T01:00:00.000Z',
  snapshot: snapshotOf(netas[i]),
  context: {
    text: base.text,
    emotions: ['fuan'],
    reasons: [],
    sceneId: 'howakai',
    tradition: 'otani',
    scale: 'auto',
  },
  ...extra,
})

describe('評価の記録', () => {
  it('その案が何でできていたかを写し取る', () => {
    for (const n of netas) {
      const s = snapshotOf(n)
      expect(s.title).toBe(n.title)
      expect(s.angleName.length).toBeGreaterThan(0)
      // 直すのに要るのは素材の名前。idだけでは読めない
      if (n.materials.conceptId) {
        expect(s.conceptTerm, n.title).toBeTruthy()
        expect(s.question, n.title).toBeTruthy()
        expect(s.scale, n.title).toBeDefined()
      }
      if (n.materials.storyId) {
        expect(s.storyTitle, n.title).toBeTruthy()
        expect(s.storyKind, n.title).toBeTruthy()
      }
      if (n.materials.figureId) expect(s.figureName, n.title).toBeTruthy()
    }
  })

  it('素材ごとに◎と△を数え、△の多い順に並べる', () => {
    const list = [rating(0, 'off'), rating(1, 'off'), rating(2, 'good')]
    const t = tally(list)
    expect(t.length).toBeGreaterThan(0)
    for (let i = 1; i < t.length; i++) expect(t[i - 1].off).toBeGreaterThanOrEqual(t[i].off)
    // 数えているのは素材であって、案ではない
    expect(t.some((x) => x.kind === '仏教語')).toBe(true)
    expect(t.some((x) => x.kind === '切り口')).toBe(true)
  })

  it('書き出しに、直すのに要るものが全部入る', () => {
    const list = [rating(0, 'off'), rating(1, 'good')]
    const md = toRatingsMarkdown(list)
    const s = snapshotOf(netas[0])
    expect(md).toContain('評価 2件')
    expect(md).toContain('△ ちがう')
    expect(md).toContain('◎ 使える')
    expect(md).toContain(s.title)
    expect(md).toContain(s.angleName)
    expect(md).toContain(s.conceptTerm!)
    expect(md).toContain(s.question!)
    // 合わなかったところと、一言
    expect(md).toContain(WHERE_LABEL.kotoba)
    expect(md).toContain('問いが硬い')
    // どんな条件で出たか
    expect(md).toContain(base.text)
    // 学習用ではないと明記する
    expect(md).toContain('学習用ではありません')
  })

  it('評価が無くても書き出しは壊れない', () => {
    expect(toRatingsMarkdown([])).toContain('まだ評価がありません')
  })

  it('◎だけでも△だけでも書き出せる', () => {
    expect(toRatingsMarkdown([rating(0, 'good')])).not.toContain('△ ちがう（')
    expect(toRatingsMarkdown([rating(0, 'off')])).not.toContain('◎ 使える（')
  })
})
