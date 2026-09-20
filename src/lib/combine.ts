import { CONCEPT_BY_ID } from '../data/concepts'
import { FIGURE_BY_ID } from '../data/figures'
import { MODERN_BY_ID } from '../data/modern'
import { PHRASE_BY_ID } from '../data/shinshu/phrases'
import { STORY_BY_ID } from '../data/stories'
import type { Concept, Neta, NetaSection, Tradition } from '../data/types'
import { WORD_BY_ID } from '../data/words'
import { SECTION } from './generate'
import { hashString } from './random'

/**
 * 気になった案を複数えらんで、一つの話に組み直す。
 *
 * ここで機械が意味をつなげてしまうと、どの案も同じ顔になる。
 * 素材は全部そのまま並べて、つなぎ目だけは語り手が入れる形にしている。
 * （［　］の一行がそれ。埋めたところに、その人の色が出る）
 */

const nq = (t: string) => t.replace(/。$/, '')

const uniq = <T,>(xs: (T | undefined)[]): T[] => {
  const out: T[] = []
  for (const x of xs) if (x !== undefined && !out.includes(x)) out.push(x)
  return out
}

const s = (label: string, body: string): NetaSection => ({ label, body })

const NUM = ['①', '②', '③', '④', '⑤', '⑥']

function conceptBlock(c: Concept, i: number, many: boolean): NetaSection {
  return s(
    many ? `${SECTION.kotoba}${NUM[i] ?? ''}` : SECTION.kotoba,
    `${c.term}（${c.reading}）。${c.oneLine}　【${c.source}】\n世間では、${nq(c.misread)}。けれども、${c.pivot}`,
  )
}

/** 二つ以上の案から、一本の話をつくる。1件以下なら組み直さない。 */
export function combineNetas(netas: Neta[]): Neta | null {
  if (netas.length < 2) return null

  const concepts = uniq(netas.map((n) => n.materials.conceptId)).map((id) => CONCEPT_BY_ID[id])
  const stories = uniq(netas.map((n) => n.materials.storyId)).map((id) => STORY_BY_ID[id])
  const words = uniq(netas.map((n) => n.materials.wordId)).map((id) => WORD_BY_ID[id])
  const figures = uniq(netas.map((n) => n.materials.figureId)).map((id) => FIGURE_BY_ID[id])
  const phrases = uniq(netas.map((n) => n.materials.phraseId)).map((id) => PHRASE_BY_ID[id])
  const moderns = uniq(netas.map((n) => n.materials.modernId)).map((id) => MODERN_BY_ID[id])

  if (concepts.length === 0) return null

  const terms = concepts.map((c) => c.term)
  const many = concepts.length > 1
  const termList = `「${terms.join('」と「')}」`
  // 見出しに三つ並べると読めなくなるので、二つまでにする
  const termHead =
    terms.length > 2 ? `「${terms[0]}」と「${terms[1]}」ほか` : termList

  // 入口は一つに絞る。二つ目からは「もう一つの場面」として後ろに置く。
  // （語り出しが二本あると、聴いている側はどちらの話か分からなくなる）
  const lead = moderns[0]?.line ?? netas[0].digest?.steps[0] ?? ''
  const extraLead =
    moderns.length > 1
      ? `\n\nもう一つ、こういう場面もあります。${moderns[1].line}`
      : ''

  // 喩え・人の話・日常語は、まとめて一つの欄に落とすと何の話か分からなくなる。
  // それぞれの欄に分けて置く。
  const tatoeBlocks = stories
    .slice(0, 2)
    .map((st) => `${st.title}。${st.summary}　【${st.source}】`)
  const hitoBlocks = figures
    .slice(0, 2)
    .map((f) => `${f.name}（${f.era}）。${f.title}、と言われる方です。${f.story}`)
  const motoBlocks = words
    .slice(0, 2)
    .map((w) => `「${w.word}」という言葉があります。いまは${nq(w.now)}。もとは、${w.origin}`)
  // 筋道には、重ねる話の名前を出す（「1つの話を重ねる」では手がかりにならない）
  const tatoeNames = [
    ...stories.slice(0, 2).map((st) => st.title),
    ...figures.slice(0, 2).map((f) => f.name),
    ...words.slice(0, 2).map((w) => `「${w.word}」`),
  ]

  const steps = uniq(concepts.map((c) => c.step))

  const sections: NetaSection[] = [
    ...(phrases.length > 0
      ? [s(SECTION.shogyo, `${phrases[0].text}　【${phrases[0].source}】\n${phrases[0].gloss}`)]
      : []),
    s(SECTION.iriguchi, `${lead}${extraLead}`),
    ...concepts.map((c, i) => conceptBlock(c, i, many)),
    ...(tatoeBlocks.length > 0 ? [s(SECTION.tatoe, tatoeBlocks.join('\n\n'))] : []),
    ...(hitoBlocks.length > 0 ? [s(SECTION.hito, hitoBlocks.join('\n\n'))] : []),
    ...(motoBlocks.length > 0 ? [s(SECTION.moto, motoBlocks.join('\n\n'))] : []),
    s(
      SECTION.kasanari,
      many
        ? `${termList}——言い方は違いますが、${
            terms.length > 2 ? 'いずれも' : 'どちらも'
          }同じ一点を指しています。\n\n［ここに、ご自身が${
            terms.length > 2 ? 'これらを' : 'この二つを'
          }どう重ねて見ているかを一言。うまくつながらなければ、無理に一つにせず、並べて置いたままでも構いません］`
        : `${termList}という一語を、二つの入口から見てみました。\n\n［ここに、ご自身がどちらの入口に立っているかを一言］`,
    ),
    s(
      SECTION.otoshi,
      steps.map((x) => `・${nq(x)}。`).join('\n'),
    ),
    s(
      SECTION.musubi,
      `今日お持ち帰りいただくのは、${termList}。それだけです。${
        many ? '全部を覚えていただかなくても、引っかかった一つで十分です。' : ''
      }`,
    ),
  ]

  const digest = {
    summary: `${termList}を、一つの話に組み直したもの`,
    steps: [
      ...(phrases.length > 0 ? [`一句から入る。「${phrases[0].text}」（${phrases[0].source}）。`] : []),
      `${lead}`,
      ...concepts.map((c) => `仏教はこれを「${c.term}」という。${nq(c.oneLine)}。`),
      ...(tatoeNames.length > 0 ? [`${tatoeNames.join('・')}を、そこに重ねる。`] : []),
      `［つなぎ目は、ご自身の言葉で一言］`,
      ...steps.map((x, i) => (i === 0 ? `だから今日は、${nq(x)}。` : `あるいは、${nq(x)}。`)),
    ],
    note: `もとにした案：${netas.map((n) => n.angleName).join('・')}（${netas.length}件）`,
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
    aim: 'えらんだ案の素材を一本に並べ、つなぎ目だけを自分の言葉で埋める',
    kojitsuke: Math.max(...netas.map((n) => n.kojitsuke)) as 1 | 2 | 3,
    title: `${termHead}を重ねて — ${moderns[0]?.scene ?? netas[0].title}`,
    sections,
    digest,
    sources: uniq(netas.flatMap((n) => n.sources)),
    cautions: uniq(netas.flatMap((n) => n.cautions)),
    materials: {
      conceptId: concepts[0]?.id,
      storyId: stories[0]?.id,
      wordId: words[0]?.id,
      figureId: figures[0]?.id,
      modernId: moderns[0]?.id,
      phraseId: phrases[0]?.id,
    },
    // 組み直したものは、一行では収まらない。
    // 掲示板・SNS（0分）の案どうしを重ねたときも、話す形として扱う。
    minutes: Math.max(...netas.map((x) => x.minutes)) || 3,
    tradition,
  }
}
