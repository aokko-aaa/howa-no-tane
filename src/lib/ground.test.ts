import { describe, expect, it } from 'vitest'
import { groundOf, groundSheet } from './ground'
import { findSituations, situationNeta, sourceById, takeNeta, takesOf } from './situations'

const netaOf = (kind: 'concept' | 'phrase' | 'figure', id: string, n = 0) => {
  const s = sourceById(kind, id)!
  return takeNeta(s, takesOf(s)[n])
}

describe('えらんだ案の、重なっているところ', () => {
  it('一件では出さない', () => {
    expect(groundOf([netaOf('concept', 'namuamidabutsu')])).toBeNull()
  })

  it('人物の案どうしでも出る（組み直しはできない組み合わせ）', () => {
    const g = groundOf([netaOf('figure', 'shaka-shimon'), netaOf('figure', 'kisagotami')])!
    expect(g).not.toBeNull()
    expect(g.items.length).toBe(2)
    // 四門出遊もキサーゴータミーも〈死・別れ〉を持っている
    expect(g.shared.map((t) => t.id)).toContain('shi-wakare')
  })

  it('人物の案と一節の案でも出る', () => {
    const g = groundOf([netaOf('figure', 'shaka-shimon'), netaOf('phrase', 'shoshinge-koushusse')])!
    expect(g.items.length).toBe(2)
    expect(g.shared.length + g.partial.length).toBeGreaterThan(0)
  })

  it('重なっている話題には、場面の側と教えの側が両方ついている', () => {
    const g = groundOf([netaOf('figure', 'shaka-shimon'), netaOf('figure', 'kisagotami')])!
    for (const t of [...g.shared, ...g.partial]) {
      expect(t.scene.length, t.label).toBeGreaterThan(0)
      expect(t.teaching.length, t.label).toBeGreaterThan(0)
      expect(t.from.length, t.label).toBeGreaterThan(1)
    }
  })

  it('ぜんぶに無いものは、いくつかのほうへ回る', () => {
    const g = groundOf([
      netaOf('figure', 'shaka-shimon'),
      netaOf('figure', 'kisagotami'),
      netaOf('concept', 'hongan'),
    ])!
    for (const t of g.shared) expect(t.from.length).toBe(3)
    for (const t of g.partial) expect(t.from.length).toBeLessThan(3)
  })

  it('情景から入れたものでも出る', () => {
    const s = sourceById('concept', 'namuamidabutsu')!
    const a = situationNeta(s, findSituations(s)[0])
    const b = situationNeta(s, findSituations(s)[1])
    expect(groundOf([a, b])).not.toBeNull()
  })

  it('持ち出す用紙は、最後のひと渡しを空けてある', () => {
    const g = groundOf([netaOf('figure', 'shaka-shimon'), netaOf('figure', 'kisagotami')])!
    const sheet = groundSheet(g)
    expect(sheet).toContain('重なっているところ')
    expect(sheet).toContain('この場面では：')
    expect(sheet).toContain('この教えは：')
    expect(sheet).toContain('ここから先は、ご自身の言葉で')
    expect(sheet).toContain('［　］')
  })

  it('機械が結びの一文を書いていない', () => {
    const g = groundOf([netaOf('figure', 'shaka-shimon'), netaOf('figure', 'kisagotami')])!
    const sheet = groundSheet(g)
    for (const ng of ['だからこそ', 'つまり', 'このように', 'ということは']) {
      expect(sheet.includes(ng), ng).toBe(false)
    }
  })
})
