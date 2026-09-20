import { describe, expect, it } from 'vitest'
import { ANGLES } from '../data/angles'
import { CONCEPTS } from '../data/concepts'
import { EMOTIONS } from '../data/emotions'
import { FIGURES, FIGURE_BY_ID } from '../data/figures'
import { PHRASES } from '../data/shinshu/phrases'
import { MODERNS } from '../data/modern'
import { REASON_BY_ID } from '../data/reasons'
import type { EmotionId } from '../data/types'
import { toOutline, toProse, toScript } from './format'
import { generateNeta, SECTION, swapMaterial, type GenerateInput } from './generate'
import { detectEmotions } from './match'

const base: GenerateInput = {
  text: '',
  emotions: ['shitto', 'hikaku'],
  sceneId: 'howakai',
  month: 5,
  kojitsukeMax: 3,
  tradition: 'any',
  seed: 12345,
  count: 6,
}

describe('generateNeta', () => {
  it('指定した数だけ出る', () => {
    expect(generateNeta(base)).toHaveLength(6)
    expect(generateNeta({ ...base, count: 12 })).toHaveLength(12)
  })

  it('同じ入力と種なら同じ結果になる（引き直すまで変わらない）', () => {
    expect(generateNeta(base)).toEqual(generateNeta(base))
  })

  it('種が変われば中身が変わる', () => {
    const a = generateNeta(base).map((n) => n.title)
    const b = generateNeta({ ...base, seed: 999 }).map((n) => n.title)
    expect(a).not.toEqual(b)
  })

  it('本文に未定義や空欄が混ざらない', () => {
    for (const n of generateNeta({ ...base, count: 24 })) {
      expect(n.title).not.toMatch(/undefined|NaN/)
      expect(n.sections.length).toBeGreaterThan(0)
      for (const s of n.sections) {
        expect(s.body.trim().length, `${n.title} / ${s.label}`).toBeGreaterThan(0)
        expect(s.body).not.toMatch(/undefined|NaN/)
      }
    }
  })

  it('こじつけ度の上限を超える切り口は出ない', () => {
    for (const n of generateNeta({ ...base, kojitsukeMax: 1, count: 12 })) {
      expect(n.kojitsuke).toBe(1)
    }
    for (const n of generateNeta({ ...base, kojitsukeMax: 2, count: 12 })) {
      expect(n.kojitsuke).toBeLessThanOrEqual(2)
    }
  })

  it('ひと回しで切り口が偏らない', () => {
    const kinds = new Set(generateNeta(base).map((n) => n.angleId))
    expect(kinds.size).toBe(6)
  })

  it('使える切り口をすべて回せる', () => {
    const general = ANGLES.filter((a) => a.tradition !== 'shinshu')
    const kinds = new Set(generateNeta({ ...base, count: general.length }).map((n) => n.angleId))
    expect(kinds.size).toBe(general.length)
  })

  it('SNS・寺報を選んでも、一行と短文の形になる', () => {
    for (const n of generateNeta({ ...base, sceneId: 'sns' })) {
      expect(n.minutes).toBe(0)
      expect(n.sections.map((s) => s.label)).toEqual([
        SECTION.hitokoto,
        SECTION.tanbun,
        SECTION.shikomi,
      ])
      // 一行は、そのまま貼れる短さ
      const hitokoto = n.sections[0].body
      expect(hitokoto.split('\n').every((line) => line.length <= 60)).toBe(true)
    }
  })

  it('掲示板を選ぶと、一行と短文の形になる', () => {
    for (const n of generateNeta({ ...base, sceneId: 'keijiban' })) {
      expect(n.minutes).toBe(0)
      expect(n.sections.map((s) => s.label)).toEqual([
        SECTION.hitokoto,
        SECTION.tanbun,
        SECTION.shikomi,
      ])
    }
  })

  it('法話会では入口から結びまでの構成で出て、最後に語り手向けメモがつく', () => {
    for (const n of generateNeta(base)) {
      const labels = n.sections.map((s) => s.label)
      expect(labels[0]).toBe(SECTION.iriguchi)
      expect(labels[labels.length - 1]).toBe(SECTION.memo)
      expect(labels[labels.length - 2]).toBe(SECTION.musubi)
      expect(labels).toContain(SECTION.otoshi)
    }
  })

  it('通し原稿には語り手向けメモを混ぜない', () => {
    for (const n of generateNeta(base)) {
      const memo = n.sections.find((s) => s.label === SECTION.memo)
      expect(memo).toBeDefined()
      expect(toProse(n)).not.toContain(memo!.body)
      expect(toScript(n)).toContain(memo!.body)
    }
  })

  it('使った素材の出典が必ずついてくる', () => {
    for (const n of generateNeta({ ...base, count: 12 })) {
      expect(n.sources.length).toBeGreaterThan(0)
      if (n.materials.storyId) {
        expect(n.sources.join('\n')).toContain('：')
      }
    }
  })

  it('気持ちを選ばなくても出る', () => {
    const out = generateNeta({ ...base, emotions: [] })
    expect(out).toHaveLength(6)
  })

  it('選んだ気持ちに当たる素材が優先される', () => {
    const emotions: EmotionId[] = ['shitto', 'hikaku']
    const out = generateNeta({ ...base, emotions, count: 6 })
    const onTag = out.filter((n) => {
      const c = CONCEPTS.find((x) => x.id === n.materials.conceptId)
      const m = MODERNS.find((x) => x.id === n.materials.modernId)
      return (
        (c?.emotions ?? []).some((e) => emotions.includes(e)) ||
        (m?.emotions ?? []).some((e) => emotions.includes(e))
      )
    })
    expect(onTag.length).toBeGreaterThanOrEqual(5)
  })

  it('選んだ気持ちに寄った素材が使われる', () => {
    const out = generateNeta({ ...base, emotions: ['wakare'], count: 12 })
    const modernIds = out.map((n) => n.materials.modernId)
    // 別れに紐づく場面が一つは選ばれる
    expect(
      modernIds.some((id) =>
        ['oshi', 'soubetsu', 'butsudan', 'byoushitsu', 'nokosareta_fuku', 'nokosareta-fuku'].includes(
          id ?? '',
        ),
      ),
    ).toBe(true)
  })
})

describe('選んだ気持ちから外れない', () => {
  // 「イライラする」を選んで、死に際の話（平生業成）が出たことへの歯止め。
  // 宗派の加点が気持ちの一致を上回っていたのが原因だった。
  it.each(EMOTIONS.map((e) => ({ id: e.id, label: e.label })))(
    '$label を選ぶと、その気持ちに当たる言葉だけが出る',
    ({ id }) => {
      for (const mode of ['otani', 'any'] as const) {
        for (const n of generateNeta({ ...base, tradition: mode, emotions: [id], count: 6 })) {
          const c = CONCEPTS.find((x) => x.id === n.materials.conceptId)!
          expect(c.emotions, `${mode} / ${c.term}`).toContain(id)
          const m = MODERNS.find((x) => x.id === n.materials.modernId)!
          expect(m.emotions, `${mode} / ${m.scene}`).toContain(id)
        }
      }
    },
  )

  it('真宗モードでも、気持ちに合わない真宗の言葉を無理に出さない', () => {
    // イライラに当たる真宗の言葉は「煩悩具足の凡夫」。それ以外の真宗語は出てはいけない
    for (const n of generateNeta({ ...base, tradition: 'otani', emotions: ['iraira'], count: 6 })) {
      const c = CONCEPTS.find((x) => x.id === n.materials.conceptId)!
      expect(c.emotions).toContain('iraira')
    }
  })

  it('気持ちが合う範囲で、真宗の言葉が優先される', () => {
    // 別れ・喪失には真宗の言葉が複数あるので、そちらが選ばれる
    const out = generateNeta({ ...base, tradition: 'otani', emotions: ['wakare'], count: 6 })
    const shinshu = out.filter(
      (n) => CONCEPTS.find((x) => x.id === n.materials.conceptId)?.tradition === 'shinshu',
    )
    expect(shinshu.length).toBeGreaterThanOrEqual(4)
  })
})

describe('書いた一件を入口にする', () => {
  const typed =
    '無くして探していた診察券を見つけた。自分のうっかりで諦めていたけど、探してもいない時にフッと出てきた'

  it('書いた文が、そのまま入口になる', () => {
    for (const n of generateNeta({ ...base, text: typed, emotions: ['yorokobi'], count: 6 })) {
      expect(n.materials.modernId).toBe('typed')
      expect(n.digest!.steps.join('\n')).toContain('診察券')
      expect(n.digest!.note).toContain('ご自身が書いた一件')
      // 「一行から入る」のように経典の一句を先に置く切り口もあるので、
      // 入口の欄そのものではなく、本文のどこかに書いた一件が出ていることを見る
      const spoken = n.sections.filter((x) => x.label !== SECTION.memo)
      expect(spoken.map((x) => x.body).join('\n'), n.angleName).toContain('診察券')
    }
  })

  const hitsText = (id: string | undefined, text: string) => {
    const c = CONCEPTS.find((x) => x.id === id)!
    return [c.term, ...(c.keywords ?? [])].some((w) => w.length >= 2 && text.includes(w))
  }

  it.each([
    ['診察券', typed],
    [
      '無くしもの',
      '無くしものが出てきてうれしい 探していた時は見つからなかったのに ふとした時にでてきて気分が明るくなった。',
    ],
    ['仏滅', '結婚式の日取りを、仏滅だからと親に反対されて決められない'],
  ])('%s の一件では、文に当たった言葉だけが出る', (_name, text) => {
    // 気持ちのタグで穴埋めして、書いた一件と関係のない言葉を混ぜない
    for (const n of generateNeta({ ...base, text, emotions: ['yorokobi'], count: 6 })) {
      expect(hitsText(n.materials.conceptId, text), `${n.title}`).toBe(true)
    }
  })

  // 語の付け間違い（「気分・機嫌・天気」が日日是好日ではなく前後際断に付いていた）を
  // 早く見つけるための、文と言葉の対応の見本
  it.each([
    ['結婚式の日取りが仏滅だと親に反対された', 'ryouji-kichijitsu'],
    ['雨で気分が沈む', 'nichinichi-kore-koujitsu'],
    ['戒名のお布施はいくらかと聞かれた', 'houmyou'],
    ['天国のおじいちゃんに会いたいと子どもが言う', 'ojodo'],
    ['もう手放そうと思ったら、こだわっていた自分に気づいた', 'hougejaku'],
    ['他力本願だと言われた', 'tariki-hongan'],
  ])('「%s」では %s が出る', (text, conceptId) => {
    const out = generateNeta({ ...base, text, emotions: [], count: 6 })
    expect(out.map((n) => n.materials.conceptId)).toContain(conceptId)
  })

  it('入口は、内蔵の場面に差し替えられる', () => {
    const rest2 = (({ pins: _p, count: _c, seed: _s, ...r }) => r)({
      ...base,
      text: typed,
      emotions: ['yorokobi'],
    })
    const n = generateNeta({ ...base, text: typed, emotions: ['yorokobi'], count: 1 })[0]
    const next = swapMaterial(n, rest2, 'modern', 8)
    expect(next.materials.modernId).not.toBe('typed')
    expect(next.materials.conceptId).toBe(n.materials.conceptId)
  })

  it('何も書かなければ、これまでどおり内蔵の場面を使う', () => {
    for (const n of generateNeta({ ...base, text: '', emotions: ['yorokobi'], count: 3 })) {
      expect(n.materials.modernId).not.toBe('typed')
      expect(n.digest!.note).toContain('差し替え可')
    }
  })
})

describe('気持ちの一段下（なんで？）', () => {
  it('理由を選ぶと、ひとことにそれが出る', () => {
    const n = generateNeta({
      ...base,
      emotions: ['iraira'],
      reasonIds: ['iraira-hito'],
      count: 1,
    })[0]
    expect(n.digest!.summary).toContain('イライラする')
    expect(n.digest!.summary).toContain('あの人が許せない')
  })

  it('理由に紐づく言葉が、実際に前へ出てくる', () => {
    const out = generateNeta({
      ...base,
      emotions: ['iraira'],
      reasonIds: ['iraira-hito'],
      count: 6,
    })
    const ids = out.map((n) => n.materials.conceptId)
    const preferred = REASON_BY_ID['iraira-hito'].concepts!
    expect(ids.some((id) => preferred.includes(id!))).toBe(true)
  })

  it('理由で足された気持ちが、素材の選び方に効く', () => {
    const withReason = generateNeta({
      ...base,
      emotions: ['fuan'],
      reasonIds: ['fuan-okane'],
      count: 6,
    })
    // お金の心配が足されるので、お金に当たる言葉や場面が入ってくる
    const hit = withReason.some((n) => {
      const c = CONCEPTS.find((x) => x.id === n.materials.conceptId)!
      const m = MODERNS.find((x) => x.id === n.materials.modernId)!
      return c.emotions.includes('okane') || m.emotions.includes('okane')
    })
    expect(hit).toBe(true)
  })

  it('理由が違えば、別の案になる', () => {
    const a = generateNeta({ ...base, emotions: ['fuan'], reasonIds: ['fuan-okane'], count: 6 })
    const b = generateNeta({ ...base, emotions: ['fuan'], reasonIds: ['fuan-kenkou'], count: 6 })
    expect(a.map((n) => n.materials.conceptId)).not.toEqual(b.map((n) => n.materials.conceptId))
  })

  it('理由を選ばなくても、これまでどおり出る', () => {
    expect(generateNeta({ ...base, emotions: ['fuan'], count: 6 })).toHaveLength(6)
    expect(generateNeta({ ...base, emotions: ['fuan'], reasonIds: [], count: 6 })).toHaveLength(6)
  })

  it('知らない理由idが混ざっても落ちない', () => {
    const out = generateNeta({ ...base, emotions: ['fuan'], reasonIds: ['nope'], count: 3 })
    expect(out).toHaveLength(3)
  })
})

describe('筋の通らない組み合わせを出さない', () => {
  it('御文・歎異抄の切り口は、その出典に合う一句があるときだけ出す', () => {
    // 合う一句が無いまま出すと、話と関係のない一句を読み上げることになる
    for (const e of EMOTIONS) {
      for (const n of generateNeta({ ...base, tradition: 'otani', emotions: [e.id], count: 12 })) {
        if (n.angleId !== 'ofumi' && n.angleId !== 'tannisho') continue
        const p = PHRASES.find((x) => x.id === n.materials.phraseId)!
        expect(p.source, `${e.label} / ${n.angleId}`).toContain(
          n.angleId === 'ofumi' ? '御文' : '歎異抄',
        )
        expect(p.emotions, `${e.label} / ${p.text}`).toContain(e.id)
      }
    }
  })

  it('行事の切り口では、行事が筋道に出てくる', () => {
    for (const n of generateNeta({ ...base, tradition: 'otani', month: 11, count: 12 })) {
      if (!n.materials.occasionId) continue
      expect(n.digest!.steps[0]).toContain('の頃です')
    }
  })
})

describe('要点（筋道）', () => {
  it('上から読めば話が通る形になっている', () => {
    for (const n of generateNeta({ ...base, count: 12 })) {
      const d = n.digest!
      expect(d, n.title).toBeDefined()
      expect(d.summary.length).toBeGreaterThan(0)
      expect(d.steps.length).toBeGreaterThanOrEqual(4)
      for (const line of d.steps) {
        expect(line.trim().length).toBeGreaterThan(0)
        expect(line).not.toMatch(/undefined|NaN/)
        // 「入口：」のようなラベルの羅列にしない
        expect(line.slice(0, 6)).not.toMatch(/^(入口|気持ち|ことば|世間|ズレ|一歩|尺)：/)
        // 文として終わる
        expect(line).toMatch(/[。」]$/)
      }
      // 筋の順番：入口 → 仏教の言葉 → ひっくり返し → 今日の一歩
      const joined = d.steps.join('\n')
      expect(joined).toContain(`「${CONCEPTS.find((c) => c.id === n.materials.conceptId)!.term}」`)
      expect(joined).toContain('世間では')
      expect(d.steps[d.steps.length - 1]).toMatch(/^だから/)
      // 「だから今日は、今日…」と重ねない
      expect(d.steps[d.steps.length - 1]).not.toContain('だから今日は、今日')
    }
  })

  it('使った素材だけが筋道に現れる', () => {
    for (const n of generateNeta({ ...base, tradition: 'otani', count: 12 })) {
      const joined = n.digest!.steps.join('\n')
      expect(joined.includes('ここで一句。')).toBe(Boolean(n.materials.phraseId))
      expect(joined.includes('は仏教の言葉で')).toBe(Boolean(n.materials.wordId))
    }
  })

  it('ひとことに、当てている気持ちとその言葉の意味が並ぶ', () => {
    const n = generateNeta({ ...base, emotions: ['iraira'], count: 1 })[0]
    expect(n.digest!.summary).toContain('イライラする')
    const c = CONCEPTS.find((x) => x.id === n.materials.conceptId)!
    expect(n.digest!.summary).toContain(c.oneLine)
  })

  it('入口の差し替えは、要点の添え書きで分かる', () => {
    const n = generateNeta({ ...base, count: 1 })[0]
    expect(n.digest!.note).toContain('ご自身の一件に差し替え可')
  })

  it('要点のコピーは、ひとこと・番号つきの筋道・出典になる', () => {
    const n = generateNeta({ ...base, count: 1 })[0]
    const text = toOutline(n)
    expect(text).toContain('■ ')
    expect(text).toContain(n.digest!.summary)
    expect(text).toContain(`1. ${n.digest!.steps[0]}`)
    expect(text).toContain('出典：')
    const memo = n.sections.find((x) => x.label === SECTION.memo)!
    expect(text).not.toContain(memo.body)
  })
})

describe('入口と切り口の入れ替え', () => {
  const rest = (({ pins: _p, count: _c, seed: _s, ...r }) => r)({ ...base })

  it('どの案にも、入口と切り口の差し替え候補がつく', () => {
    for (const n of generateNeta({ ...base, count: 6 })) {
      expect(n.alternatives!.modernIds.length).toBeGreaterThan(1)
      expect(n.alternatives!.angleIds.length).toBeGreaterThan(1)
      expect(n.alternatives!.modernIds[0]).toBe(n.materials.modernId)
      expect(n.alternatives!.angleIds[0]).toBe(n.angleId)
    }
  })

  it('入口を変えても、ことば・喩え・切り口は変わらない', () => {
    const n = generateNeta({ ...base, count: 1 })[0]
    const next = swapMaterial(n, rest, 'modern', 42)
    expect(next.materials.modernId).not.toBe(n.materials.modernId)
    expect(next.materials.conceptId).toBe(n.materials.conceptId)
    expect(next.angleId).toBe(n.angleId)
    expect(next.id).not.toBe(n.id)
  })

  it('切り口を変えても、ことばは変わらない', () => {
    const n = generateNeta({ ...base, count: 1 })[0]
    const next = swapMaterial(n, rest, 'angle', 42)
    expect(next.angleId).not.toBe(n.angleId)
    expect(next.materials.conceptId).toBe(n.materials.conceptId)
  })

  it('押すたびに候補を順に回り、元に戻ってくる', () => {
    let n = generateNeta({ ...base, count: 1 })[0]
    const first = n.materials.modernId
    const seen = new Set<string>([first!])
    for (let i = 0; i < n.alternatives!.modernIds.length - 1; i++) {
      n = swapMaterial(n, rest, 'modern', 100 + i)
      seen.add(n.materials.modernId!)
    }
    expect(seen.size).toBe(n.alternatives!.modernIds.length)
    n = swapMaterial(n, rest, 'modern', 999)
    expect(n.materials.modernId).toBe(first)
  })

  it('入れ替えても、筋道は組み直される', () => {
    const n = generateNeta({ ...base, count: 1 })[0]
    const next = swapMaterial(n, rest, 'modern', 7)
    expect(next.digest!.steps[0]).not.toBe(n.digest!.steps[0])
    expect(next.digest!.note).toContain('差し替え可')
  })
})

describe('条件を指定して作る', () => {
  it('仏教語を名指しすると、すべての案がその言葉で組まれる', () => {
    const out = generateNeta({ ...base, count: 6, pins: { conceptId: 'engi' } })
    expect(out.every((n) => n.materials.conceptId === 'engi')).toBe(true)
    // 切り口は変わるので、同じ言葉でも別の入り方が並ぶ
    expect(new Set(out.map((n) => n.angleId)).size).toBeGreaterThan(1)
  })

  it('切り口を名指しすると、その切り口だけが出る', () => {
    const out = generateNeta({ ...base, count: 5, pins: { angleId: 'gogen' } })
    expect(out.every((n) => n.angleId === 'gogen')).toBe(true)
  })

  it('こじつけ度の上限より強い切り口でも、名指しなら出せる', () => {
    const out = generateNeta({ ...base, kojitsukeMax: 1, count: 3, pins: { angleId: 'kojitsuke' } })
    expect(out.every((n) => n.angleId === 'kojitsuke')).toBe(true)
  })

  it('お聖教の一句を名指しすると、その一句を読む切り口になる', () => {
    const out = generateNeta({
      ...base,
      tradition: 'otani',
      count: 4,
      pins: { phraseId: 'tannisho-3' },
    })
    expect(out.every((n) => n.materials.phraseId === 'tannisho-3')).toBe(true)
    expect(out.every((n) => ['shogyo', 'ofumi', 'tannisho'].includes(n.angleId))).toBe(true)
  })

  it('喩え話と日常語も名指しできる', () => {
    const out = generateNeta({
      ...base,
      count: 4,
      pins: { angleId: 'tatoe-swap', storyId: 'dokuya' },
    })
    expect(out.every((n) => n.materials.storyId === 'dokuya')).toBe(true)
    const w = generateNeta({ ...base, count: 4, pins: { angleId: 'gogen', wordId: 'gaman' } })
    expect(w.every((n) => n.materials.wordId === 'gaman')).toBe(true)
  })

  it('宗派を問わないモードで一句だけ指定しても落ちない', () => {
    const out = generateNeta({
      ...base,
      tradition: 'any',
      count: 3,
      pins: { phraseId: 'tannisho-3' },
    })
    expect(out).toHaveLength(3)
  })
})

describe('真宗大谷派モード', () => {
  const otani: GenerateInput = { ...base, tradition: 'otani', emotions: ['wakare', 'shi'] }

  it('真宗の切り口と、宗派を問わない切り口が交互に並ぶ', () => {
    const out = generateNeta(otani)
    const shinshuAngles = new Set(
      ANGLES.filter((a) => a.tradition === 'shinshu').map((a) => a.id),
    )
    const flags = out.map((n) => shinshuAngles.has(n.angleId))
    expect(flags.filter(Boolean).length).toBe(3)
    expect(flags[0]).toBe(true)
    expect(flags[1]).toBe(false)
  })

  it('同じ言葉ばかりにならない', () => {
    // 真宗の切り口で固めていたころ、イライラでは一語しか出なくなっていた
    const out = generateNeta({ ...otani, emotions: ['iraira'], count: 6 })
    expect(new Set(out.map((n) => n.materials.conceptId)).size).toBeGreaterThanOrEqual(3)
  })

  it('真宗の切り口には、気持ちに合う真宗の素材が当たる', () => {
    const shinshuAngles = new Set(ANGLES.filter((a) => a.tradition === 'shinshu').map((a) => a.id))
    for (const n of generateNeta({ ...otani, count: 12 })) {
      if (!shinshuAngles.has(n.angleId)) continue
      const c = CONCEPTS.find((x) => x.id === n.materials.conceptId)!
      expect(c.tradition, n.title).toBe('shinshu')
      expect(c.emotions.some((e) => otani.emotions.includes(e)), n.title).toBe(true)
    }
  })

  it('宗派を問わないモードでは真宗固有の切り口を出さない', () => {
    const out = generateNeta({ ...base, tradition: 'any', count: 18 })
    const shinshuAngles = new Set(
      ANGLES.filter((a) => a.tradition === 'shinshu').map((a) => a.id),
    )
    expect(out.some((n) => shinshuAngles.has(n.angleId))).toBe(false)
  })

  it('気持ちに合う範囲で、真宗の素材が多数を占める', () => {
    const out = generateNeta({ ...otani, count: 18 })
    const shinshu = out.filter((n) => {
      const c = CONCEPTS.find((x) => x.id === n.materials.conceptId)
      return c?.tradition === 'shinshu'
    })
    expect(shinshu.length / out.length).toBeGreaterThan(0.5)
  })

  it('御文・歎異抄の切り口は、その出典の一句を引く', () => {
    const out = generateNeta({ ...otani, count: 12 })
    for (const n of out) {
      const phrase = PHRASES.find((p) => p.id === n.materials.phraseId)
      if (n.angleId === 'ofumi') expect(phrase?.source).toContain('御文')
      if (n.angleId === 'tannisho') expect(phrase?.source).toContain('歎異抄')
    }
  })

  it('声に出す本文に、大谷派で避ける言い方が混ざらない', () => {
    // 「戒名」「天国」は、法名・お浄土の説明として言い直すために本文へ出る（引用は可）。
    // ここで見るのは、そのまま使うと筋が変わってしまう言い方だけ。
    const avoid = ['ご冥福', '追善供養', '草葉の陰', '浮かばれ', '御霊前', 'ご利益があり']
    for (const sceneId of ['houji', 'sougo', 'howakai', 'tsukimairi'] as const) {
      for (const n of generateNeta({ ...otani, sceneId, count: 18 })) {
        const spoken = n.sections
          .filter((x) => x.label !== SECTION.memo)
          .map((x) => x.body)
          .join('\n')
        for (const word of avoid) {
          expect(spoken.includes(word), `${n.title} / ${word}`).toBe(false)
        }
      }
    }
  })

  it('結びにお念仏の一句が添えられる（掲示板をのぞく）', () => {
    for (const n of generateNeta({ ...otani, count: 12 })) {
      const musubi = n.sections.find((x) => x.label === SECTION.musubi)!
      expect(
        /南無阿弥陀仏|なんまんだぶ|お聴聞|あなかしこ/.test(musubi.body),
        n.title,
      ).toBe(true)
    }
  })

  it('大谷派の言い回しの注意が、語り手向けメモに入る', () => {
    for (const n of generateNeta({ ...otani, count: 6 })) {
      const memo = n.sections.find((x) => x.label === SECTION.memo)!
      expect(memo.body).toContain('大谷派の言い回し')
    }
  })
})

describe('人の小ネタ（偉人のサイドストーリー）', () => {
  it('「人の話から」の切り口は、人物の話を本文に入れる', () => {
    const [n] = generateNeta({ ...base, count: 1, pins: { angleId: 'hito' } })
    const f = FIGURE_BY_ID[n.materials.figureId!]
    expect(f, '人物が使われている').toBeTruthy()
    const spoken = n.sections.map((x) => x.body).join('\n')
    expect(spoken).toContain(f.name)
    expect(spoken).toContain(f.story)
    expect(n.sources.some((s) => s.startsWith(f.name))).toBe(true)
  })

  it('「身のまわりの出どころ」は、暮らしの品に結びつく人物だけを引く', () => {
    for (const n of generateNeta({ ...base, count: 4, pins: { angleId: 'yurai' } })) {
      const f = FIGURE_BY_ID[n.materials.figureId!]
      expect(f?.everyday, n.title).toBeTruthy()
      expect(n.sections.map((x) => x.body).join('\n')).toContain(f.everyday!)
    }
  })

  it('人物を名指しすると、その人物で組む', () => {
    for (const id of ['takuan', 'eisai-cha', 'shuri-handoku']) {
      const [n] = generateNeta({ ...base, count: 1, pins: { angleId: 'hito', figureId: id } })
      expect(n.materials.figureId).toBe(id)
    }
  })

  it('人物の話が、要点の筋道にも出る', () => {
    const [n] = generateNeta({ ...base, count: 1, pins: { angleId: 'hito' } })
    const f = FIGURE_BY_ID[n.materials.figureId!]
    expect(n.digest!.steps.join('\n')).toContain(f.name)
  })

  it('どの気持ちでも、人物の切り口が空回りしない', () => {
    for (const e of EMOTIONS) {
      for (const angleId of ['hito', 'yurai']) {
        const [n] = generateNeta({
          ...base,
          emotions: [e.id],
          count: 1,
          pins: { angleId },
        })
        expect(n.materials.figureId, `${e.id} / ${angleId}`).toBeTruthy()
        for (const s of n.sections) {
          expect(s.body).not.toMatch(/undefined|NaN/)
        }
      }
    }
  })

  it('由来話には、断定しないための注意が語り手向けメモに入る', () => {
    const [n] = generateNeta({ ...base, count: 1, pins: { angleId: 'yurai' } })
    expect(n.sections.find((x) => x.label === SECTION.memo)!.body).toContain('諸説')
  })

  it('注意書きのある人物は、そのまま「語る前に確認」に出る', () => {
    const withCaution = FIGURES.find((f) => f.caution)!
    const [n] = generateNeta({
      ...base,
      count: 1,
      pins: { angleId: 'hito', figureId: withCaution.id },
    })
    expect(n.cautions.join('\n')).toContain(withCaution.caution!)
  })
})

describe('detectEmotions', () => {
  it('書かれた文から気持ちを拾う', () => {
    expect(detectEmotions('同級生のSNSを見て、つい比べてしまう')).toContain('hikaku')
    expect(detectEmotions('親に同じことを三度聞かれてイライラした')).toContain('iraira')
    expect(detectEmotions('')).toEqual([])
  })
})
