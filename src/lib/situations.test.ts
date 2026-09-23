import { describe, expect, it } from 'vitest'
import { MODERNS } from '../data/modern'
import { TOPICS } from '../data/topics'
import { SEARCH_ALIASES } from '../data/aliases'
import {
  bridges,
  countByKind,
  findSituations,
  sourceById,
  sourcesOf,
  SOURCE_KINDS,
  toWorksheet,
} from './situations'

/** その言葉で探したとき、どの棚に何件出るか */
const hits = (term: string) =>
  SOURCE_KINDS.flatMap((k) => sourcesOf(k).filter((s) => s.search.includes(term)))

describe('ふだんの言い方で探せる', () => {
  // 表に出す言い方は大谷派のものに揃えてあるので、
  // ふだん口にする言い方で打つと〇件になる。それを防ぐ。
  it('「釈迦」で探して、釈尊の素材が出る', () => {
    const found = hits('釈迦')
    expect(found.length).toBeGreaterThan(0)
    expect(found.some((s) => s.search.includes('釈尊'))).toBe(true)
  })

  it.each(['お釈迦さま', 'ブッダ', '御文章', '戒名', '天国', 'なんまんだぶ', '他力本願'])(
    '「%s」で探して、何か出る',
    (term) => {
      expect(hits(term).length).toBeGreaterThan(0)
    },
  )

  it('「釈迦」で、お釈迦さまの説かれた仏教語も出る', () => {
    // 仏教語は別々の名前で並んでいるが、出どころはお釈迦さまへ戻る。
    // source が検索から漏れていて、経の名でも出てこなかった。
    const c = sourcesOf('concept').filter((s) => s.search.includes('釈迦')).map((s) => s.title)
    expect(c.length).toBeGreaterThan(10)
    for (const term of ['四諦', '八正道', '中道', '諸行無常']) {
      expect(c, term).toContain(term)
    }
  })

  it('出どころの語が、語の一致だけで取り違えられない', () => {
    // 「六波羅蜜寺」は寺の名で、六波羅蜜の教えの話ではない
    const kuuya = sourcesOf('figure').find((s) => s.id === 'kuuya')!
    expect(kuuya.search.includes('六波羅蜜寺')).toBe(true)
    expect(kuuya.search.includes('釈迦'), '空也が釈迦で出てしまう').toBe(false)
  })

  it('仏教語を、出どころの名でも探せる', () => {
    expect(sourcesOf('concept').filter((s) => s.search.includes('歎異抄')).length).toBeGreaterThan(0)
  })

  it('別の呼び名の表に、元の語の重複がない', () => {
    const terms = SEARCH_ALIASES.map((a) => a.term)
    expect(new Set(terms).size).toBe(terms.length)
  })

  it('〈語る前に確認〉にしか無かった語でも探せる', () => {
    // 注意書きは検索に入らない。そこにしか書いていない語は、
    // 手がかりの語へ移しておかないと「二河白道」で〇件になる。
    for (const term of [
      '二河白道',
      '一枚起請文',
      '往生要集',
      '御伝鈔',
      '盂蘭盆経',
      '真宗本廟',
      '十住毘婆沙論',
      '浄土論',
      '恵信尼消息',
      '口あい',
    ]) {
      expect(hits(term).length, term).toBeGreaterThan(0)
    }
  })

  it('小ネタの手がかりの語でも探せる', () => {
    // keywords が検索から漏れていたことがある
    expect(hits('不器用').length).toBeGreaterThan(0)
  })

  it('別の棚に何件あるかを数えられる', () => {
    const c = countByKind('釈迦')
    expect(c.figure).toBeGreaterThan(0)
    expect(c.concept + c.phrase + c.figure).toBe(hits('釈迦').length)
  })
})

describe('話したいことから情景を引く', () => {
  it.each(SOURCE_KINDS)('%s の選択肢が、中身の揃った形で出る', (kind) => {
    const list = sourcesOf(kind)
    expect(list.length).toBeGreaterThan(20)
    for (const s of list) {
      expect(s.title.length, s.id).toBeGreaterThan(0)
      expect(s.body.length, s.id).toBeGreaterThan(0)
      expect(s.hint.length, s.id).toBeGreaterThan(0)
      expect(s.topics.length, `${s.id}: 話題が無いと情景を引けない`).toBeGreaterThan(0)
      expect(s.search, s.id).toContain(s.title)
    }
    expect(new Set(list.map((x) => x.id)).size).toBe(list.length)
  })

  it('どの話したいことからも、情景が出る', () => {
    for (const kind of SOURCE_KINDS) {
      for (const s of sourcesOf(kind)) {
        expect(findSituations(s).length, `${kind}/${s.id}: ${s.title}`).toBeGreaterThan(0)
      }
    }
  })

  it('並んだ情景は、必ず話題か気持ちが重なっている', () => {
    for (const kind of SOURCE_KINDS) {
      for (const s of sourcesOf(kind)) {
        for (const x of findSituations(s)) {
          expect(
            x.sharedTopics.length + x.sharedEmotions.length,
            `${s.title} / ${x.modern.scene}`,
          ).toBeGreaterThan(0)
        }
      }
    }
  })

  it('話題の重なりが多いものから並ぶ', () => {
    for (const s of sourcesOf('concept')) {
      const xs = findSituations(s)
      for (let i = 1; i < xs.length; i++) {
        expect(xs[i - 1].score, s.title).toBeGreaterThanOrEqual(xs[i].score)
      }
    }
  })

  it('どの情景にも「そこで思っていること」がある', () => {
    // 話したいことと情景を結ぶときは、場面そのものより、そこで動いている心が手がかりになる
    for (const m of MODERNS) {
      expect(m.omoi?.length, `${m.id}: ${m.scene}`).toBeGreaterThan(5)
      expect(m.omoi, m.id).not.toBe(m.line)
    }
  })

  it('下ごしらえの用紙は、両側を並べてつなぎ目を空ける（機械が結論を書かない）', () => {
    const s = sourceById('concept', 'mukudoku')!
    const sheet = toWorksheet(s, findSituations(s)[0])
    expect(sheet).toContain('話したいこと')
    expect(sheet).toContain(s.title)
    expect(sheet).toContain('情景')
    expect(sheet).toContain('そこで思っていること')
    expect(sheet).toContain('重なっているところ')
    expect(sheet).toContain('ここから先は、ご自身の言葉で')
    expect(sheet).toContain('［　］')
    // 「だからこうつながります」と機械が言い切らない
    expect(sheet).not.toMatch(/だから|ですから|つまり/)
  })

  it('重なりの名前が二度出ない', () => {
    for (const kind of SOURCE_KINDS) {
      for (const s of sourcesOf(kind)) {
        for (const x of findSituations(s, 3)) {
          const line = toWorksheet(s, x)
            .split('\n')
            .find((l) => l.startsWith('■ 重なっているところ'))!
          const names = line.replace('■ 重なっているところ：', '').split('／')
          expect(new Set(names).size, line).toBe(names.length)
        }
      }
    }
  })

  it('どの話題にも、場面の側と言葉の側の両方がある', () => {
    // 「重なっています：たよる」とラベルの名前を出すだけでは、
    // なぜその場面でその言葉が要るのかが分からない。
    for (const tp of TOPICS) {
      expect(tp.scene.length, tp.id).toBeGreaterThan(10)
      expect(tp.teaching.length, tp.id).toBeGreaterThan(10)
      expect(tp.scene, tp.id).not.toBe(tp.teaching)
    }
  })

  it('重なった話題の数だけ、橋が出る', () => {
    for (const kind of SOURCE_KINDS) {
      for (const s of sourcesOf(kind)) {
        for (const x of findSituations(s, 5)) {
          expect(bridges(x).length, `${s.title} / ${x.modern.scene}`).toBe(x.sharedTopics.length)
          for (const b of bridges(x)) {
            expect(b.scene.length).toBeGreaterThan(0)
            expect(b.teaching.length).toBeGreaterThan(0)
          }
        }
      }
    }
  })

  it('下ごしらえの用紙に、どこで重なるかが両側とも入る', () => {
    const s = sourceById('concept', 'namuamidabutsu')!
    const sit = findSituations(s).find((x) => x.modern.id === 'byoushitsu')!
    const sheet = toWorksheet(s, sit)
    for (const b of bridges(sit)) {
      expect(sheet).toContain(b.label)
      expect(sheet).toContain(b.scene)
      expect(sheet).toContain(b.teaching)
    }
    expect(sheet).toContain('この場面では')
    expect(sheet).toContain('この言葉は')
    // 最後のひと渡しは、機械が書かない
    expect(sheet).toContain('［　］')
  })

  it('無い素材を指定しても落ちない', () => {
    expect(sourceById('concept', 'nope')).toBeUndefined()
    expect(sourceById('phrase', 'nope')).toBeUndefined()
    expect(sourceById('figure', 'nope')).toBeUndefined()
  })
})
