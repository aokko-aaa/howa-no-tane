import { describe, expect, it } from 'vitest'
import { SCENES } from '../data/angles'
import { EMOTIONS } from '../data/emotions'
import type { Neta, SceneId } from '../data/types'
import { COMBINED, combineNetas } from './combine'
import { generateNeta } from './generate'

/**
 * 組み合わせの総当たり。
 *
 * 組み直しは、気持ち・場面・宗派・自筆の有無・保存の新旧・入れ子の深さが
 * 掛け算で効くところなので、一つずつ手で見ても崩れは見つからない。
 * ここで全部回して、崩れの形（題の二重、場面の混線、筋道への指示混入、
 * 見出しの重複・欠落）が一件も出ないことを見る。
 */

/** 場面の文を持っていない古い保存を再現する */
const asOldSave = (n: Neta): Neta => ({
  ...n,
  materials: { ...n.materials, modernScene: undefined, modernLine: undefined },
})

const STEP_HEADS =
  /^(一句|場面|いま起きていること|世間では|今日の一語|たとえに|人の話に|ことばのもとは|ここが山|もう一つの場面|もう一語|同じことが、こちらでも|自分の言葉で|今日の一歩|結び)：/

function expectSound(where: string, c: Neta | null) {
  expect(c, `${where}: 組めなかった`).toBeTruthy()
  if (!c) return
  const labels = c.sections.map((s) => s.label)
  const steps = c.digest!.steps

  // 題が、別の案の題をまるごと拾って二重にならない
  expect((c.title.match(/ — /g) ?? []).length, `${where}: ${c.title}`).toBeLessThanOrEqual(1)
  expect(c.title, where).not.toMatch(/undefined|NaN/)

  // 場面の文に、言葉の言い換えが全角空白でつながったまま残らない。
  // （一句の中の全角空白「煩悩障眼雖不見　大悲無倦常照我」は正しいので、句点のうしろだけ見る）
  const hajimari = c.sections.find((s) => s.label === COMBINED.hajimari)!
  expect(hajimari.body, `${where}: はじまりの混線`).not.toContain('。　')

  for (const st of steps) {
    expect(st, `${where}: 場面の混線`).not.toMatch(/^場面：.*。　/)
    // 語り手への指示は演出メモへ。筋道に混ざると何の話か読めなくなる
    expect(st, `${where}: 筋道に指示`).not.toMatch(/持ち帰らせ|飛ばすと|落とす。|声に出さない|使いどころ/)
    // どの一行にも、話のどこにいるかを示す頭がつく
    expect(st, `${where}: 頭がない`).toMatch(STEP_HEADS)
    // 「今日の一語：「◯◯」＝◯◯」が同じことを二度言わない
    const m = st.match(/^(今日の一語|もう一語)：「(.+?)」＝(.+?)(?:。けれども、|$)/)
    if (m) expect(m[3], `${where}: 同語反復 ${st}`).not.toContain(m[2].slice(0, 5))
  }

  // 見出しは重複せず、要るものが揃い、受けの前には必ず山が入る
  expect(new Set(labels).size, `${where}: 見出し重複 ${labels.join('/')}`).toBe(labels.length)
  for (const need of [
    COMBINED.hajimari,
    COMBINED.okite,
    COMBINED.jibun,
    COMBINED.ippo,
    COMBINED.musubi,
    COMBINED.memo,
  ]) {
    expect(labels, `${where}: ${need} が無い`).toContain(need)
  }
  expect(labels.some((x) => x.startsWith(COMBINED.ichigo)), `${where}: 今日の一語が無い`).toBe(true)
  const mou = labels.findIndex((x) => x.startsWith(COMBINED.mouichigo))
  if (mou >= 0) {
    const yama = labels.indexOf(COMBINED.yama)
    expect(yama, `${where}: 受けの前に山が無い`).toBeGreaterThan(-1)
    expect(yama, `${where}: 山が受けより後ろ`).toBeLessThan(mou)
  }

  // 空欄・未定義・句点の壊れ
  for (const s of c.sections) {
    expect(s.body.trim().length, `${where}: 空欄 ${s.label}`).toBeGreaterThan(0)
    expect(s.body, `${where}: 未定義 ${s.label}`).not.toMatch(/undefined|NaN|\[object/)
    expect(s.body, `${where}: 句点の壊れ ${s.label}`).not.toMatch(/。。|、。|——。/)
  }

  // 述語で終わる場面名を、助詞に直接つながない（「既読がつかないの場面」）
  const scene = c.materials.modernScene
  if (scene) {
    expect(c.sections.map((s) => s.body).join('\n'), `${where}: ${scene}`).not.toContain(
      `${scene}の場`,
    )
  }
}

const TYPED = '無くして探していた診察券を見つけた。探してもいない時にフッと出てきた'

describe('組み合わせの総当たり', () => {
  it.each(EMOTIONS.map((e) => ({ id: e.id, label: e.label })))(
    '$label — どの場面・どの教え・自筆あり／なしで組んでも崩れない',
    ({ id }) => {
      for (const sc of SCENES) {
        for (const tradition of ['otani', 'any'] as const) {
          for (const text of ['', TYPED]) {
            const r = generateNeta({
              text,
              emotions: [id],
              sceneId: sc.id as SceneId,
              month: (id.length % 12) + 1,
              kojitsukeMax: 3,
              tradition,
              seed: 1000 + id.length * 7 + sc.minutes,
              count: 6,
            })
            const w = `${id}/${sc.id}/${tradition}${text ? '/自筆' : ''}`
            expectSound(`${w} 2件`, combineNetas(r.slice(0, 2)))
            expectSound(`${w} 6件`, combineNetas(r))
            // 古い保存（場面の文を持っていない）
            expectSound(`${w} 旧保存3件`, combineNetas(r.slice(0, 3).map(asOldSave)))
            // 同じ案を二つえらんだとき
            expectSound(`${w} 同一2件`, combineNetas([r[0], { ...r[0], id: `${r[0].id}x` }]))
            // 組んだものを、さらに組む（ネタ帳で溜めた場合）
            const ab = combineNetas(r.slice(0, 2))
            const cd = combineNetas(r.slice(2, 4))
            if (ab && cd) {
              const abcd = combineNetas([ab, cd])
              expectSound(`${w} 再組み`, abcd)
              if (abcd) expectSound(`${w} 三段組み`, combineNetas([abcd, r[5]]))
            }
          }
        }
      }
    },
  )

  it('自分で書いた一件は、古い保存から組み直しても入口に残る', () => {
    const r = generateNeta({
      text: TYPED,
      emotions: ['yorokobi'],
      sceneId: 'keijiban',
      month: 5,
      kojitsukeMax: 3,
      tradition: 'otani',
      seed: 77,
      count: 4,
    })
    const out = combineNetas(r.slice(0, 3).map(asOldSave))!
    const hajimari = out.sections.find((s) => s.label === COMBINED.hajimari)!
    expect(hajimari.body).toContain('診察券')
    // 言葉の言い換えがくっついたままにならない
    expect(hajimari.body).not.toContain('。　')
  })
})
