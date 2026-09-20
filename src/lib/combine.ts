import { CONCEPT_BY_ID } from '../data/concepts'
import { FIGURE_BY_ID } from '../data/figures'
import { MODERN_BY_ID } from '../data/modern'
import { PHRASE_BY_ID } from '../data/shinshu/phrases'
import { STORY_BY_ID } from '../data/stories'
import type {
  Concept,
  EmotionId,
  Neta,
  NetaMaterials,
  NetaSection,
  Tradition,
} from '../data/types'
import { WORD_BY_ID } from '../data/words'
import { SECTION } from './generate'
import { hashString } from './random'

/**
 * 気になった案を複数えらんで、一つの話に組み直す。
 *
 * 素材を並べるだけでは筋が通らない。話の筋は一本しか通らないので、
 * 集めた仏教語を横に並べず、役をふる。
 *
 *   軸（主）… 今日の話はこの一語のこと。入口から結びまで、これで通す
 *   受け（副）… 軸だけでは足りないところへ渡すために、一度だけ出す
 *   控え … 残り。語らずに演出メモへ回す（素材としては消さない）
 *
 * 軸→受けの渡し（SECTION.watashi2）を抜くと、ただ二語が並んだだけになる。
 * ここが、この組み直しの背骨。
 *
 * 機械が書けないのは、その人がこの二語をどう見ているかの一行だけ。
 * そこは［　］で空けてある。
 */

const nq = (t: string) => t.replace(/。$/, '')

const uniq = <T,>(xs: (T | undefined)[]): T[] => {
  const out: T[] = []
  for (const x of xs) if (x !== undefined && !out.includes(x)) out.push(x)
  return out
}

/** idから素材を引く。データに無いidは黙って落とす（古い保存を読んでも壊れないように） */
const lookup = <T,>(ids: (string | undefined)[], by: Record<string, T>): T[] =>
  uniq(ids).map((id) => by[id]).filter((x): x is T => x !== undefined)

/** 入口の場面。自分で書いた一件は内蔵データに無いので、案が持っている文をそのまま使う */
type Lead = { id: string; scene: string; line: string; emotions: readonly EmotionId[]; own: boolean }

function leadsFrom(mats: NetaMaterials[]): Lead[] {
  const out: Lead[] = []
  for (const m of mats) {
    if (!m.modernId || out.some((x) => x.id === m.modernId)) continue
    const built = MODERN_BY_ID[m.modernId]
    const scene = m.modernScene ?? built?.scene
    const line = m.modernLine ?? built?.line
    if (!scene || !line) continue
    out.push({
      id: m.modernId,
      scene,
      line,
      emotions: built?.emotions ?? [],
      // 自分で書いた一件は、内蔵の場面より先に入口へ立てる
      own: m.modernId === 'typed',
    })
  }
  return out
}

const s = (label: string, body: string): NetaSection => ({ label, body })

/** 二つのタグの重なりの数 */
const overlap = (a: readonly EmotionId[], b: Set<EmotionId>) => a.filter((x) => b.has(x)).length

/** 気持ちの向きが、軸の言葉と近いものから先に使う（筋がそれないように） */
function byFit<T extends { emotions: readonly EmotionId[] }>(xs: T[], c: Concept): T[] {
  const tags = new Set(c.emotions)
  return [...xs].sort((a, b) => overlap(b.emotions, tags) - overlap(a.emotions, tags))
}

/**
 * 軸にする言葉を選ぶ。
 * 集めた言葉のうち、ほかの言葉といちばん気持ちが重なっているものを軸にする。
 * （端に寄った言葉を軸にすると、ほかが全部ぶら下がらない）
 */
function pickJiku(concepts: Concept[]): Concept {
  let best = concepts[0]
  let bestScore = -1
  for (const c of concepts) {
    const others = new Set(concepts.filter((x) => x.id !== c.id).flatMap((x) => x.emotions))
    const score = overlap(c.emotions, others)
    if (score > bestScore) {
      best = c
      bestScore = score
    }
  }
  return best
}

const conceptBody = (c: Concept) =>
  `${c.term}（${c.reading}）。${c.oneLine}　【${c.source}】\nけれども、${c.pivot}`

/** 二つ以上の案から、一本の話をつくる。1件以下なら組み直さない。 */
export function combineNetas(netas: Neta[]): Neta | null {
  if (netas.length < 2) return null

  // 組んだものを、さらに組めるように。
  // 組み合わせの案は materials に各種ひとつしか持てないので、
  // もとの案の素材（sourceMaterials）があればそちらを開いて使う。
  const mats: NetaMaterials[] = netas.flatMap((n) => n.sourceMaterials ?? [n.materials])

  const allConcepts = lookup(mats.map((m) => m.conceptId), CONCEPT_BY_ID)
  const stories = lookup(mats.map((m) => m.storyId), STORY_BY_ID)
  const words = lookup(mats.map((m) => m.wordId), WORD_BY_ID)
  const figures = lookup(mats.map((m) => m.figureId), FIGURE_BY_ID)
  const phrases = lookup(mats.map((m) => m.phraseId), PHRASE_BY_ID)
  const moderns = leadsFrom(mats)

  if (allConcepts.length === 0) return null

  // 語るのは二語まで。三語を対等に並べると、聴き手はどれが今日の話か分からなくなる。
  const jiku = pickJiku(allConcepts)
  const rest = allConcepts.filter((c) => c.id !== jiku.id)
  // 受けは、軸といちばん気持ちが近いもの。遠いものを受けに置くと、渡しが効かない。
  const uke = byFit(rest, jiku)[0]
  const hikaeConcepts = rest.filter((c) => c.id !== uke?.id)

  // その言葉と組んで出てきた素材は、生成のときに気持ちを合わせてある。
  // 寄せ集めから選び直すより、もとの取り合わせをそのまま使うほうが筋が通る。
  const matOf = (c?: Concept) => (c ? mats.find((m) => m.conceptId === c.id) : undefined)
  const jikuMat = matOf(jiku)
  const ukeMat = matOf(uke)

  // 入口は一つ。二つ目の場面は、受けの言葉を出すところで使う。
  // （語り出しが二本あると、どちらの話か分からなくなる）
  // 自分で書いた一件があれば、それが入口。無ければ軸と組んで出てきた場面。
  const own = moderns.find((m) => m.own)
  const leadModern =
    own ?? moderns.find((m) => m.id === jikuMat?.modernId) ?? byFit(moderns, jiku)[0]
  const lead = leadModern?.line ?? netas[0].digest?.steps[0] ?? ''
  const others = moderns.filter((m) => m.id !== leadModern?.id)
  const secondModern = uke
    ? (others.find((m) => m.id === ukeMat?.modernId) ?? byFit(others, uke)[0])
    : others[0]
  // 述語で終わる場面名（「既読がつかない」など）を、助詞に続けられる形にする
  const sceneRef = !leadModern
    ? 'あの場面'
    : leadModern.own
      ? 'さきほどの一件'
      : `「${leadModern.scene}」の場面`

  // 支えの話は、軸のうしろに一つ、受けのうしろに一つ。残りは控えへ。
  // 人の話 → 喩え → 日常語 の順に強い（人の話がいちばん入りやすい）
  const supports = [
    ...figures.map((f) => ({
      label: SECTION.hito,
      id: f.id,
      name: f.name,
      emotions: f.emotions,
      body: `${f.name}（${f.era}）。${f.title}、と言われる方です。${f.story}`,
    })),
    ...stories.map((st) => ({
      label: SECTION.tatoe,
      id: st.id,
      name: st.title,
      emotions: st.emotions,
      body: `${st.title}。${st.summary}　【${st.source}】`,
    })),
    ...words.map((w) => ({
      label: SECTION.moto,
      id: w.id,
      name: `「${w.word}」`,
      emotions: w.emotions,
      body: `「${w.word}」という言葉があります。いまは${nq(w.now)}。もとは、${w.origin}`,
    })),
  ]
  // 軸のうしろには、軸と組んで出てきた話。無ければ気持ちの近いもの。
  const fromMat = (m: NetaMaterials | undefined, pool: typeof supports) =>
    m
      ? pool.find(
          (x) => x.id === m.figureId || x.id === m.storyId || x.id === m.wordId,
        )
      : undefined
  const support1 = fromMat(jikuMat, supports) ?? byFit(supports, jiku)[0]
  const rest1 = supports.filter((x) => x.id !== support1?.id)
  const support2 = uke ? (fromMat(ukeMat, rest1) ?? byFit(rest1, uke)[0]) : undefined
  const hikaeSupports = supports.filter((x) => x.id !== support1?.id && x.id !== support2?.id)

  const phrase =
    (jikuMat?.phraseId ? PHRASE_BY_ID[jikuMat.phraseId] : undefined) ?? phrases[0]

  // 軸だけでは届かないところへ渡す一段。これがこの組み直しの背骨。
  const watashi = uke
    ? [
        s(
          SECTION.watashi2,
          `——と、ここまでが「${jiku.term}」の話です。\n\nただ、言葉として分かっても、${sceneRef}に立てば、また同じところでつまずきます。分かることと、できることは別です。\n\nそこでもう一つ、「${
            uke.term
          }」という言葉を置いてみます。${secondModern ? `\n\n${secondModern.line}` : ''}`,
        ),
        s(`${SECTION.kotoba}（もう一つ）`, conceptBody(uke)),
        ...(support2 ? [s(support2.label, support2.body)] : []),
      ]
    : secondModern
      ? [
          s(
            SECTION.watashi2,
            `同じことが、こちらでも起こります。${secondModern.line}\n\n場面は違いますが、立っているところは同じです。`,
          ),
        ]
      : []

  const kasanariBody = uke
    ? `今日は「${jiku.term}」を軸に置いて、そこへ「${uke.term}」を重ねました。${nq(
        jiku.oneLine,
      )}——そのうえで、${nq(uke.oneLine)}。\n\n［この二つが、ご自身の中でどうつながっているか、ここに一行だけ。うまく一つにならなければ、「私にはまだ結びついていません」でも構いません。そこが入ると、借り物の話になりません］`
    : `同じ「${jiku.term}」という一語を、二つの場面から見てみました。\n\n［ご自身がどちらの場面に立っておられるか、ここに一行だけ］`

  const otoshiBody = uke
    ? `${nq(jiku.step)}。\n\nそれで足りなければ、${nq(uke.step)}。`
    : `${nq(jiku.step)}。`

  const memo = [
    `軸は「${jiku.term}」。入口から結びまで、この一語で通す。`,
    ...(uke
      ? [
          `「${uke.term}」は受け。${jiku.term}だけでは届かないところへ渡すために、一度だけ出す。〈${SECTION.watashi2}〉を飛ばすと、二語が並んだだけになる。`,
          `尺が足りなければ、〈${SECTION.watashi2}〉から〈${SECTION.kotoba}（もう一つ）〉までをまるごと落とす。${jiku.term}だけで一本になる。`,
        ]
      : []),
    ...(hikaeConcepts.length > 0 || hikaeSupports.length > 0
      ? [
          `${SECTION.hikae}：${[
            ...hikaeConcepts.map((c) => c.term),
            ...hikaeSupports.map((x) => x.name),
          ].join('・')}。今日は出さない。次に組み直すときの材料として残してある。`,
        ]
      : []),
    `［　］の一行は、必ず自分の言葉で埋める。ここが空のままだと、どこかで聞いた話になる。`,
  ]

  const sections: NetaSection[] = [
    ...(phrase ? [s(SECTION.shogyo, `${phrase.text}　【${phrase.source}】\n${phrase.gloss}`)] : []),
    s(SECTION.iriguchi, lead),
    s(
      SECTION.hikkakari,
      // 入口で置いた場面を受け直してから中身に入る。ここを飛ばすと、
      // 場面と言葉が地続きにならず、別々の話に聞こえる。
      `こういうとき、私たちの中では何が起きているか。${nq(jiku.everyday)}。\n\n世間では、${nq(
        jiku.misread,
      )}。`,
    ),
    s(SECTION.kotoba, conceptBody(jiku)),
    ...(support1 ? [s(support1.label, support1.body)] : []),
    ...watashi,
    s(SECTION.kasanari, kasanariBody),
    s(SECTION.otoshi, otoshiBody),
    s(
      SECTION.musubi,
      `${phrase ? `もう一度、あの一句を。${phrase.text}\n\n` : ''}今日お持ち帰りいただくのは、「${
        jiku.term
      }」。一語で十分です。${
        uke ? `「${uke.term}」のほうは、引っかかった方だけが持って帰ってくだされば。` : ''
      }${sceneRef}で立ち止まったとき、これを一つ、思い出してください。`,
    ),
    s(SECTION.memo, memo.join('\n')),
  ]

  const digest = {
    summary: uke
      ? `「${jiku.term}」を軸に、「${uke.term}」を重ねて一本にしたもの`
      : `「${jiku.term}」を、二つの場面から見た一本`,
    steps: [
      ...(phrase ? [`一句を置く。「${phrase.text}」（${phrase.source}）。`] : []),
      lead,
      `世間では、${nq(jiku.misread)}。`,
      `仏教はこれを「${jiku.term}」という。${nq(jiku.oneLine)}。`,
      ...(support1 ? [`${support1.name}を、そこに重ねる。`] : []),
      ...(uke
        ? [
            `——ここまでが「${jiku.term}」。ただ、分かってもその場ではつまずく。`,
            `そこで「${uke.term}」を置く。${nq(uke.oneLine)}。`,
            ...(secondModern ? [secondModern.line] : []),
            ...(support2 ? [`${support2.name}を、そこに重ねる。`] : []),
          ]
        : secondModern
          ? [`同じことが、こちらでも。${secondModern.line}`]
          : []),
      `［この二つが自分の中でどうつながっているか、一行だけ自分の言葉で］`,
      `だから今日は、${nq(jiku.step)}。`,
      `結びは「${jiku.term}」に戻る。二語とも持ち帰らせようとしない。`,
    ],
    note: `もとにした案${netas.length}件（${netas
      .map((x) =>
        x.angleId === 'combine' ? `組み合わせ${(x.sourceMaterials ?? []).length}件ぶん` : x.angleName,
      )
      .join('・')}）／軸は「${jiku.term}」${
      uke ? `・受けは「${uke.term}」` : ''
    }${hikaeConcepts.length > 0 ? `／控え${hikaeConcepts.length}語` : ''}`,
  }

  const traditions = netas.map((n) => n.tradition)
  const tradition: Tradition = traditions.includes('shinshu')
    ? 'shinshu'
    : traditions.every((x) => x === 'zen')
      ? 'zen'
      : 'common'

  return {
    id: `combine-${hashString(netas.map((n) => n.id).join('+'))}`,
    angleId: 'combine',
    angleName: '組み合わせ',
    aim: '一語を軸に据え、もう一語を渡しでつないで、一本の筋にする',
    kojitsuke: Math.max(...netas.map((n) => n.kojitsuke)) as 1 | 2 | 3,
    title: uke
      ? `「${jiku.term}」に「${uke.term}」を重ねて — ${leadModern?.scene ?? netas[0].title}`
      : `「${jiku.term}」— ${leadModern?.scene ?? netas[0].title}`,
    sections,
    digest,
    sources: uniq(netas.flatMap((n) => n.sources)),
    cautions: uniq(netas.flatMap((n) => n.cautions)),
    materials: {
      conceptId: jiku.id,
      storyId: stories[0]?.id,
      wordId: words[0]?.id,
      figureId: figures[0]?.id,
      modernId: leadModern?.id,
      modernScene: leadModern?.scene,
      modernLine: leadModern?.line,
      phraseId: phrase?.id,
    },
    // さらに組み直せるように、もとの素材をそのまま持たせておく
    sourceMaterials: mats,
    // 組み直したものは、一行では収まらない。
    // 掲示板・SNS（0分）の案どうしを重ねたときも、話す形として扱う。
    minutes: Math.max(...netas.map((x) => x.minutes)) || 3,
    tradition,
  }
}
