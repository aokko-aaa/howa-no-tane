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
 *   軸（主）… 今日の話はこの一語のこと。はじまりから結びまで、これで通す
 *   受け（副）… 軸だけでは届かないところへ渡すために、一度だけ出す
 *   控え … 残り。語らずに演出メモへ回す（素材としては消さない）
 *
 * 見出しは、素材の種類名（「入口」「ひっかかり」）ではなく、
 * 話のどこにいるかで付ける。読んだ人が順番どおりに喋れることを優先する。
 * 語り手への指示は本文と筋道には出さず、演出メモにだけ書く。
 */

/** 組み直した話の見出し。上から順に喋れば一本になる並びにしてある */
export const COMBINED = {
  ku: 'お聖教の一句',
  hajimari: 'はじまり — この場面から',
  okite: 'そこで起きていること',
  ichigo: '今日の一語',
  tatoe: 'たとえに',
  hito: '人の話に',
  moto: 'ことばのもとは',
  yama: 'ここが山 — 一語では届かない',
  mouichigo: 'もう一語',
  jibun: '自分の言葉で（ここだけは埋めてください）',
  ippo: '今日の一歩',
  musubi: SECTION.musubi,
  memo: SECTION.memo,
} as const

const nq = (t: string) => t.replace(/。$/, '')

const uniq = <T,>(xs: (T | undefined)[]): T[] => {
  const out: T[] = []
  for (const x of xs) if (x !== undefined && !out.includes(x)) out.push(x)
  return out
}

/** idから素材を引く。データに無いidは黙って落とす（古い保存を読んでも壊れないように） */
const lookup = <T,>(ids: (string | undefined)[], by: Record<string, T>): T[] =>
  uniq(ids).map((id) => by[id]).filter((x): x is T => x !== undefined)

const firstSentence = (t: string) => nq(t.split(/(?<=。)/)[0] ?? t)

/**
 * その言葉を一行で言うと何か。
 * 「怨みは怨みによって止まず」のように、見出し語とほぼ同じ一行を持つ言葉がある。
 * そのまま出すと同じことを二度言うだけになるので、暮らしの言い換えのほうを使う。
 */
function gist(c: Concept): string {
  const head = c.term.slice(0, Math.min(5, c.term.length))
  return c.oneLine.includes(head) ? c.everyday : c.oneLine
}

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

/** はじまりに置く場面。自分で書いた一件は内蔵データに無いので、案が持っている文を使う */
type Lead = { id: string; scene: string; line: string; emotions: readonly EmotionId[]; own: boolean }

const leadOf = (id: string, scene: string, line: string): Lead => ({
  id,
  scene,
  line,
  emotions: MODERN_BY_ID[id]?.emotions ?? [],
  // 自分で書いた一件は、内蔵の場面より先にはじまりへ立てる
  own: id === 'typed',
})

function leadsFrom(mats: NetaMaterials[]): Lead[] {
  const out: Lead[] = []
  for (const m of mats) {
    if (!m.modernId || out.some((x) => x.id === m.modernId)) continue
    const built = MODERN_BY_ID[m.modernId]
    const scene = m.modernScene ?? built?.scene
    const line = m.modernLine ?? built?.line
    if (scene && line) out.push(leadOf(m.modernId, scene, line))
  }
  return out
}

/**
 * 場面の文を持っていない古い保存から、はじまりの文を拾い直す。
 * これが無いと、自分で書いた一件が組み直しのたびに消える。
 */
function recoverLead(n: Neta): Lead | undefined {
  const id = n.materials.modernId
  // 内蔵の場面は MODERN_BY_ID から引けるので、拾い直しが要るのは自分で書いた一件だけ。
  // （欄から拾うと、切り口によっては場面ではない文が入口の欄に来る）
  if (id !== 'typed' || n.materials.modernLine) return undefined
  const sec = n.sections.find((s) => s.label.startsWith('入口') || s.label.startsWith('はじまり'))
  // 掲示板・SNSの案にははじまりの欄がないので、そのときは筋道の一行目から拾う。
  const line = splitLead(sec?.body ?? n.digest?.steps[0] ?? '').trim()
  if (!line) return undefined
  return leadOf(id, n.materials.modernScene ?? 'ご自身の一件', line)
}

const s = (label: string, body: string): NetaSection => ({ label, body })

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

  if (allConcepts.length === 0) return null

  const moderns = leadsFrom(mats)
  for (const n of netas) {
    const rec = recoverLead(n)
    if (rec && !moderns.some((m) => m.id === rec.id)) moderns.push(rec)
  }

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

  // はじまりは一つ。二つ目の場面は、受けの言葉を出すところで使う。
  // （語り出しが二本あると、どちらの話か分からなくなる）
  const own = moderns.find((m) => m.own)
  const leadModern =
    own ?? moderns.find((m) => m.id === jikuMat?.modernId) ?? byFit(moderns, jiku)[0]
  const others = moderns.filter((m) => m.id !== leadModern?.id)
  const secondModern = uke
    ? (others.find((m) => m.id === ukeMat?.modernId) ?? byFit(others, uke)[0])
    : others[0]
  // 述語で終わる場面名（「既読がつかない」など）を、助詞に続けられる形にする
  const sceneRef = !leadModern
    ? 'あの場面'
    : leadModern.own
      ? 'さきほどの場面'
      : `「${leadModern.scene}」の場面`

  const supports = [
    ...figures.map((f) => ({
      label: COMBINED.hito,
      id: f.id,
      name: f.name,
      emotions: f.emotions,
      head: `${f.name} — ${f.title}`,
      gist: `${f.name}——${nq(f.title)}。`,
      body: `${f.name}（${f.era}）。${f.title}、と言われる方です。${f.story}`,
      memo: f.hook,
    })),
    ...stories.map((st) => ({
      label: COMBINED.tatoe,
      id: st.id,
      name: st.title,
      emotions: st.emotions,
      head: st.title,
      gist: `${st.title}——${firstSentence(st.summary)}。`,
      body: `${st.title}。${st.summary}　【${st.source}】`,
      memo: st.point,
    })),
    ...words.map((w) => ({
      label: COMBINED.moto,
      id: w.id,
      name: `「${w.word}」`,
      emotions: w.emotions,
      head: `「${w.word}」`,
      gist: `「${w.word}」は、もとは${nq(w.origin)}。`,
      body: `「${w.word}」という言葉があります。いまは${nq(w.now)}。もとは、${w.origin}`,
      memo: w.gap,
    })),
  ]
  // 軸のうしろには、軸と組んで出てきた話。無ければ気持ちの近いもの。
  const fromMat = (m: NetaMaterials | undefined, pool: typeof supports) =>
    m ? pool.find((x) => x.id === m.figureId || x.id === m.storyId || x.id === m.wordId) : undefined
  const support1 = fromMat(jikuMat, supports) ?? byFit(supports, jiku)[0]
  const rest1 = supports.filter((x) => x.id !== support1?.id)
  const support2 = uke ? (fromMat(ukeMat, rest1) ?? byFit(rest1, uke)[0]) : undefined
  const hikaeSupports = supports.filter((x) => x.id !== support1?.id && x.id !== support2?.id)

  const phrase = (jikuMat?.phraseId ? PHRASE_BY_ID[jikuMat.phraseId] : undefined) ?? phrases[0]

  const conceptBody = (c: Concept) =>
    `${c.term}（${c.reading}）。${gist(c)}　【${c.source}】\n\nけれども、${c.pivot}`

  // 軸だけでは届かないところへ渡す一段。これがこの組み直しの背骨。
  const watashi = uke
    ? [
        s(
          COMBINED.yama,
          `——と、ここまでが「${jiku.term}」の話です。\n\nただ、言葉として分かっても、${sceneRef}に立てば、また同じところでつまずきます。分かることと、できることは別です。\n\nそこでもう一語、置いてみます。${
            secondModern ? `\n\n${secondModern.line}` : ''
          }`,
        ),
        s(`${COMBINED.mouichigo} —「${uke.term}」`, conceptBody(uke)),
        ...(support2 ? [s(`${support2.label} — ${support2.head}`, support2.body)] : []),
      ]
    : secondModern
      ? [
          s(
            COMBINED.yama,
            `同じことが、こちらでも起こります。${secondModern.line}\n\n場面は違いますが、立っているところは同じです。`,
          ),
        ]
      : []

  const jibunBody = uke
    ? `「${jiku.term}」と「${uke.term}」。${nq(gist(jiku))}——そのうえで、${nq(gist(uke))}。\n\n［この二つが、ご自身の中でどうつながっているか、ここに一行だけ。うまく一つにならなければ、「私にはまだ結びついていません」でも構いません。そこが入ると、借り物の話になりません］`
    : `同じ「${jiku.term}」という一語を、二つの場面から見てみました。\n\n［ご自身がどちらの場面に立っておられるか、ここに一行だけ］`

  const memo = [
    `軸は「${jiku.term}」。はじまりから結びまで、この一語で通す。結びも軸に戻す。二語とも持ち帰らせようとしない。`,
    ...(uke
      ? [
          `「${uke.term}」は受け。${jiku.term}だけでは届かないところへ渡すために、一度だけ出す。〈${COMBINED.yama}〉を飛ばすと、二語が並んだだけになる。`,
          `尺が足りなければ、〈${COMBINED.yama}〉から〈${COMBINED.mouichigo}〉までをまるごと落とす。${jiku.term}だけで一本になる。`,
        ]
      : []),
    ...(support1 ? [`${support1.name}の使いどころ：${support1.memo}`] : []),
    ...(support2 ? [`${support2.name}の使いどころ：${support2.memo}`] : []),
    ...(hikaeConcepts.length > 0 || hikaeSupports.length > 0
      ? [
          `控え（今日は使わない）：${[
            ...hikaeConcepts.map((c) => c.term),
            ...hikaeSupports.map((x) => x.name),
          ].join('・')}。次に組み直すときの材料として残してある。`,
        ]
      : []),
    `〈${COMBINED.jibun}〉の［　］は、必ず自分の言葉で埋める。ここが空のままだと、どこかで聞いた話になる。`,
  ]

  const sections: NetaSection[] = [
    ...(phrase
      ? [s(COMBINED.ku, `${phrase.text}　【${phrase.source}】\n\n${phrase.gloss}`)]
      : []),
    s(COMBINED.hajimari, lead(leadModern, netas)),
    s(
      COMBINED.okite,
      // はじまりで置いた場面を受け直してから中身に入る。ここを飛ばすと、
      // 場面と言葉が地続きにならず、別々の話に聞こえる。
      `こういうとき、私たちの中では何が起きているか。${nq(jiku.everyday)}。\n\n世間では、${nq(
        jiku.misread,
      )}。`,
    ),
    s(`${COMBINED.ichigo} —「${jiku.term}」`, conceptBody(jiku)),
    ...(support1 ? [s(`${support1.label} — ${support1.head}`, support1.body)] : []),
    ...watashi,
    s(COMBINED.jibun, jibunBody),
    s(
      COMBINED.ippo,
      uke ? `${nq(jiku.step)}。\n\nそれで足りなければ、${nq(uke.step)}。` : `${nq(jiku.step)}。`,
    ),
    s(
      COMBINED.musubi,
      `${phrase ? `もう一度、あの一句を。${phrase.text}\n\n` : ''}今日持って帰っていただくのは、「${
        jiku.term
      }」。この一語だけで十分です。${
        uke ? `「${uke.term}」のほうは、引っかかった方だけ持って帰ってください。` : ''
      }${sceneRef}で立ち止まったとき、これを一つ、思い出してください。`,
    ),
    s(COMBINED.memo, memo.join('\n')),
  ]

  // 筋道は、上から読めばそのまま喋れる並びにする。
  // 「〜に戻す」「〜しない」といった語り手への指示は入れない（演出メモへ回す）。
  const steps: string[] = [
    ...(phrase ? [`一句：「${phrase.text}」（${phrase.source}）＝${nq(phrase.gloss)}。`] : []),
    `場面：${lead(leadModern, netas)}`,
    `いま起きていること：${nq(jiku.everyday)}。`,
    `世間では：${nq(jiku.misread)}。`,
    `今日の一語：「${jiku.term}」＝${nq(gist(jiku))}。けれども、${jiku.pivot}`,
    ...(support1 ? [`${support1.label}：${support1.gist}`] : []),
    ...(uke
      ? [
          `ここが山：分かっても、${sceneRef}に立てばまた同じところでつまずく。`,
          ...(secondModern ? [`もう一つの場面：${secondModern.line}`] : []),
          `もう一語：「${uke.term}」＝${nq(gist(uke))}。けれども、${uke.pivot}`,
          ...(support2 ? [`${support2.label}：${support2.gist}`] : []),
        ]
      : secondModern
        ? [`同じことが、こちらでも：${secondModern.line}`]
        : []),
    `自分の言葉で：［この二つが自分の中でどうつながっているか、一行だけ］`,
    `今日の一歩：${nq(jiku.step)}。`,
    `結び：「${jiku.term}」の一語に戻して終える。`,
  ]

  const digest = {
    summary: uke
      ? `「${jiku.term}」を軸に、「${uke.term}」を一度だけ重ねて一本にしたもの`
      : `「${jiku.term}」を、二つの場面から見た一本`,
    steps,
    note: `もとにした案${netas.length}件（${netas
      .map((x) =>
        x.angleId === 'combine' ? `組み合わせ${(x.sourceMaterials ?? []).length}件ぶん` : x.angleName,
      )
      .join('・')}）${hikaeConcepts.length > 0 ? `／控え${hikaeConcepts.length}語` : ''}`,
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
    // 受けの言葉は見出しに入れない（要点の一行と見出しで二度出ると、どちらが今日の話か分からなくなる）
    title: leadModern ? `「${jiku.term}」を軸に — ${leadModern.scene}` : `「${jiku.term}」を軸に`,
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

/**
 * 「場面の文　言葉の言い換え。」とつないである一行から、場面の文だけを取る。
 * 全角空白そのものは一句（「煩悩障眼雖不見　大悲無倦常照我」）にも出るので、
 * 句点のうしろで区切れているときだけ切る。
 */
function splitLead(step: string): string {
  const at = step.indexOf('。　')
  return at >= 0 ? step.slice(0, at + 1) : step
}

/** はじまりの一文。どの案からも拾えなければ、書いてもらうための空欄を出す */
function lead(leadModern: Lead | undefined, netas: Neta[]): string {
  if (leadModern) return leadModern.line
  const first = netas[0].digest?.steps[0]
  return first ? splitLead(first) : '［ここに、今日の場面を一つ］'
}
