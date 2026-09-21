import { CONCEPT_BY_ID } from '../data/concepts'
import { FIGURE_BY_ID } from '../data/figures'
import { MODERN_BY_ID } from '../data/modern'
import { PHRASE_BY_ID } from '../data/shinshu/phrases'
import { STORY_BY_ID } from '../data/stories'
import type { Neta, NetaSection } from '../data/types'
import { WORD_BY_ID } from '../data/words'
import { SECTION } from './generate'

/**
 * 気に入った案を、話の型に組み直す。
 * 素材は変えず、並べ方と言い方だけを型に合わせる。
 */
export type StructureId = 'toi' | 'kishou' | 'prep'

export const STRUCTURES: { id: StructureId; label: string; note: string }[] = [
  {
    id: 'toi',
    label: '問い',
    note: '答えではなく問いから入り、答えを渡さずに、問いを持って帰ってもらう',
  },
  { id: 'kishou', label: '起承転結', note: '場面から入り、ひっくり返して、暮らしへ戻す' },
  { id: 'prep', label: 'PREP', note: '言いたいことを先に置き、理由と例で支えて、もう一度言う' },
]

const nq = (t: string) => t.replace(/。$/, '')

/** 案の中から、入口として語られている文を取り出す */
function opening(neta: Neta): string {
  // 案が場面の文を持っているなら、それがいちばん確か（自分で書いた一件も残る）
  if (neta.materials.modernLine) return neta.materials.modernLine
  const sec = neta.sections.find(
    (s) => s.label.startsWith('入口') || s.label.startsWith('はじまり'),
  )
  if (sec) return sec.body
  const modern = neta.materials.modernId ? MODERN_BY_ID[neta.materials.modernId] : undefined
  return modern?.line ?? neta.digest?.steps[0] ?? ''
}

/** 喩え・一句など、例として出せるもの */
function example(neta: Neta): string {
  const story = neta.materials.storyId ? STORY_BY_ID[neta.materials.storyId] : undefined
  if (story) return `${story.title}。${story.summary}`
  const figure = neta.materials.figureId ? FIGURE_BY_ID[neta.materials.figureId] : undefined
  if (figure) return `${figure.name}（${figure.era}）。${figure.story}`
  const phrase = neta.materials.phraseId ? PHRASE_BY_ID[neta.materials.phraseId] : undefined
  if (phrase) return `${phrase.text}（${phrase.source}）。${phrase.gloss}`
  const word = neta.materials.wordId ? WORD_BY_ID[neta.materials.wordId] : undefined
  if (word) return `「${word.word}」という言葉があります。いまは${nq(word.now)}。ところがもとは、${word.origin}`
  return ''
}

export function buildStructure(neta: Neta, id: StructureId): NetaSection[] {
  const c = neta.materials.conceptId ? CONCEPT_BY_ID[neta.materials.conceptId] : undefined
  if (!c) return neta.sections
  const lead = opening(neta)
  const ex = example(neta)
  const musubi = neta.sections.find((s) => s.label === SECTION.musubi)?.body ?? ''

  if (id === 'toi') {
    // 答えから始めると説教になる。問いを先に置いて、答えは渡さずに帰ってもらう。
    // 〈間〉を欄として立てているのは、黙る場所が書かれていないと、
    // 語り手がそのまま答えへ進んでしまうため。
    return [
      { label: '① その場面', body: lead },
      { label: '② 問い（声に出す）', body: `——${nq(c.question)}。` },
      {
        label: '③ 間（声に出さない）',
        body:
          'ここで答えを言わない。二拍おく。\n聴いている人が、自分の一件を思い出す時間。急ぐと、問いが問いのまま届かない。',
      },
      {
        label: '④ 世間の答え',
        body: `世間では、${nq(c.misread)}。

それで片づくなら、この問いはとっくに消えています。`,
      },
      {
        label: '⑤ 手がかり',
        body: `${c.term}（${c.reading}）。${nq(c.oneLine)}。　【${c.source}】

${c.pivot}${
          ex ? `

${ex}` : ''
        }`,
      },
      {
        label: '⑥ 問いに戻す',
        body: `もう一度うかがいます。${nq(c.question)}。

答えは言いません。持ったまま帰っていただくのが、今日のおみやげです。

［ここに、ご自身ならこの問いにどう答えるか、一行だけ］`,
      },
      { label: '⑦ 今日の一歩', body: `${nq(c.step)}。${musubi ? `\n\n${musubi}` : ''}` },
    ]
  }

  if (id === 'kishou') {
    return [
      { label: '起（場面）', body: lead },
      {
        label: '承（そこで起きていること）',
        body: `${nq(c.everyday)}。世間では、${nq(c.misread)}。`,
      },
      {
        label: '転（ひっくり返す）',
        body: `けれども、${c.pivot}　仏教ではこれを「${c.term}」といいます。${
          ex ? `\n\n${ex}` : ''
        }`,
      },
      {
        label: '結（暮らしへ戻す）',
        body: `${nq(c.step)}。${musubi ? `\n\n${musubi}` : ''}`,
      },
    ]
  }

  return [
    {
      label: 'P：言いたいこと',
      body: `今日申し上げたいのは、${nq(c.oneLine)}、ということです。仏教ではこれを「${c.term}」といいます。`,
    },
    {
      label: 'R：なぜそう言えるのか',
      body: `世間では、${nq(c.misread)}。けれども、${c.pivot}　【${c.source}】`,
    },
    {
      label: 'E：たとえば',
      body: `${lead}${ex ? `\n\n${ex}` : ''}`,
    },
    {
      label: 'P：もう一度',
      body: `ですから、${nq(c.step)}。${nq(c.oneLine)}——「${c.term}」とは、そういう言葉です。`,
    },
  ]
}
