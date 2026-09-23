import { ANGLES, ANGLE_BY_ID, SCENE_BY_ID } from '../data/angles'
import { CONCEPTS, CONCEPT_BY_ID } from '../data/concepts'
import { EMOTION_BY_ID } from '../data/emotions'
import { FIGURES, FIGURE_BY_ID } from '../data/figures'
import { MODERNS, MODERN_BY_ID } from '../data/modern'
import { REASON_BY_ID } from '../data/reasons'
import { OCCASIONS } from '../data/occasions'
import { MANNERS } from '../data/shinshu/manners'
import { PHRASES, PHRASE_BY_ID } from '../data/shinshu/phrases'
import { STORIES, STORY_BY_ID } from '../data/stories'
import { WORDS, WORD_BY_ID } from '../data/words'
import type {
  Angle,
  Concept,
  EmotionId,
  Figure,
  Manner,
  Phrase,
  Tradition,
  TraditionMode,
  Modern,
  Neta,
  NetaSection,
  Occasion,
  Scene,
  SceneId,
  Story,
  TopicId,
  Word,
} from '../data/types'
import { rankItems, type Ranked } from './match'
import { hashString, mulberry32, shuffle, type Rand } from './random'

export const SECTION = {
  iriguchi: '入口（一般の人の思考起点）',
  hikkakari: 'ひっかかり',
  toi: '問い',
  kotoba: '仏教のことば',
  tatoe: 'たとえ・逸話',
  hito: '人の話（小ネタ）',
  yurai: '身のまわりの出どころ',
  zure: '視座のズレ',
  seken: '世間の見方',
  hotoke: '仏の見方',
  otoshi: '落とし込み',
  musubi: '結び',
  watashi: 'ここで仏教へ渡す',
  shogyo: 'お聖教の一句',
  honne: '聴き手の本音（先に言ってしまう）',
  seken_tsukaikata: '世間での使い方',
  moto: 'もとの意味',
  memo: '演出メモ（語り手向け・声に出さない）',
  hitokoto: '掲示の一行（案）',
  tanbun: '短文（寺報・SNS）',
  shikomi: '仕込み（聞かれたら話す中身）',
} as const

export type GenerateInput = {
  text: string
  emotions: EmotionId[]
  sceneId: SceneId
  month: number
  /** こじつけ度の上限（1=素直のみ 3=全部） */
  kojitsukeMax: 1 | 2 | 3
  /** 'otani' で真宗大谷派の素材と切り口を優先する */
  tradition: TraditionMode
  /** 話の大きさ。'auto' は書かれた文・気持ち・場面から決める */
  scale?: ScaleMode
  /** 気持ちの一段下（「なんで？」で選んだ理由） */
  reasonIds?: string[]
  seed: number
  count: number
  /** 名指しで指定された素材・切り口（条件検索） */
  pins?: Pins
}

/** 「この言葉で」「この一句で」「この切り口で」と指定するための条件 */
export type Pins = {
  angleId?: string
  modernId?: string
  conceptId?: string
  phraseId?: string
  storyId?: string
  wordId?: string
  figureId?: string
}

/**
 * 話の大きさ。
 * 「家事子育てに追われて自分が分からない」という一件に、
 * 往生や臨終の話を返すと、こじつけ以前に届かない。
 * 入口の桁に、仏教語の桁を合わせるための目盛り。
 */
export type ScaleMode = 'kurashi' | 'auto' | 'inochi'

/** 暮らしの側の言葉。書かれた文にこれがあれば、話は小さいほうへ寄せる */
const KURASHI_WORDS = [
  '家事', '子育て', '育児', '子ども', '保育', '学校', '宿題', '仕事', '職場', '上司', '同僚',
  '通勤', '残業', '締切', '会議', '買い物', '洗濯', '掃除', '料理', '皿', 'ゴミ', '片づけ',
  '寝不足', 'スマホ', 'SNS', '既読', '近所', '当番', '順番', '渋滞', '電車',
]
/** いのちの側の言葉。これがあれば、大きい話が要る */
const INOCHI_WORDS = [
  '死', '亡く', '余命', '末期', '危篤', '臨終', '看取', '葬儀', '通夜', '納骨', '遺骨',
  '闘病', 'がん', '余命', 'いのち', '命日', '一周忌', '三回忌',
]

/** 気持ちの、ふだんの大きさ */
const EMOTION_SCALE: Record<string, 1 | 2 | 3> = {
  iraira: 1, aseri: 1, isogashii: 1, hikaku: 1, okane: 1, kazoku: 1, ningenkankei: 1,
  yorokobi: 1, tassei: 1, hajimari: 1, shitto: 1, urami: 1, shounin: 1,
  fuan: 2, ochikomi: 2, tsukare: 2, koukai: 2, zaiakukan: 2, jikokeno: 2, kodoku: 2,
  munashisa: 2, mayoi: 2, henka: 2, mukuwarenai: 2, kansha: 2, yasuragi: 2,
  shi: 3, wakare: 3,
}

/**
 * 今日の話をどの大きさで組むか。
 * 書かれた文がいちばん確かな手がかりなので、そこを最優先にする。
 */
export function targetScale(
  mode: ScaleMode,
  text: string,
  emotions: EmotionId[],
  scene: Scene,
): 1 | 2 | 3 {
  if (mode === 'kurashi') return 1
  if (mode === 'inochi') return 3
  // 通夜・葬儀のあとは、場そのものが大きい話を求めている
  if (scene.id === 'sougo') return 3
  if (INOCHI_WORDS.some((w) => text.includes(w))) return 3
  if (KURASHI_WORDS.some((w) => text.includes(w))) return 1
  const fromEmotions = emotions.map((e) => EMOTION_SCALE[e] ?? 2)
  // いちばん重い気持ちに合わせる（軽いほうに合わせると、死別が軽く扱われる）
  return (fromEmotions.length > 0 ? (Math.max(...fromEmotions) as 1 | 2 | 3) : 2)
}

type Ctx = {
  emotionLabels: string[]
  primaryLabel: string
  userText: string
  modern: Modern
  concept: Concept
  story: Story
  figure: Figure
  word: Word
  occasion: Occasion
  phrase: Phrase
  scene: Scene
  mode: TraditionMode
}

type Built = {
  title: string
  sections: NetaSection[]
  /** 語り手にだけ見せる注意・ねらい（本文には混ぜない） */
  meta: string[]
  /** 実際に使った素材（出典と注意書きの収集に使う） */
  uses: {
    concept?: boolean
    story?: boolean
    word?: boolean
    figure?: boolean
    occasion?: boolean
    phrase?: boolean
  }
}

const s = (label: string, body: string): NetaSection => ({ label, body })

/** タイトルに入れるために一句を詰める */
const short = (t: string, n = 16) => (t.length > n ? `${t.slice(0, n)}…` : t)

/** 文の途中に埋めるとき、末尾の句点を外す */
const nq = (t: string) => t.replace(/。$/, '')

/**
 * 「ここに自分の◯◯を一つ」と書かせるときの、場面の呼び方。
 * 自分で書いた一件が入口のときに「ご自身の一件」と書くと、
 * いま書いたものをもう一度書かせることになる。
 */
const ownScene = (c: Ctx) =>
  c.modern.id === 'typed' ? 'いま話したあの一件' : `「${c.modern.scene}」`

const conceptLine = (c: Concept) =>
  `${c.term}（${c.reading}）。${c.oneLine}　【${c.source}】`

const figureLine = (f: Figure) => `${f.name}（${f.era}）。${f.title}、と言われる方です。`

const storyLine = (st: Story) => `${st.summary}　【${st.source}】`

const BUILDERS: Record<string, (c: Ctx) => Built> = {
  ura: (c) => ({
    title: `${c.modern.scene}の裏にあるもの — ${c.concept.term}`,
    uses: { concept: true },
    meta: [],
    sections: [
      s(SECTION.iriguchi, c.modern.line),
      s(
        SECTION.hikkakari,
        `${c.primaryLabel}という気持ちは、裏返せば「本当はこうであってほしい」という願いです。${c.concept.everyday}`,
      ),
      s(SECTION.kotoba, conceptLine(c.concept)),
      s(SECTION.zure, `世間では、${nq(c.concept.misread)}。けれども、${c.concept.pivot}`),
      s(SECTION.otoshi, c.concept.step),
      s(
        SECTION.musubi,
        `${c.modern.scene}で立ち止まったあの時間は、無駄ではありません。そこに「${c.concept.term}」という言葉を一つ、置いて帰ってください。`,
      ),
    ],
  }),

  gogen: (c) => ({
    title: `「${c.word.word}」は、もともと仏教のことば`,
    uses: { word: true, concept: true },
    meta: [c.word.gap],
    sections: [
      s(SECTION.iriguchi, `${c.modern.line}　そういうとき、私たちは「${c.word.word}」という言葉を使います。`),
      s(SECTION.hikkakari, `いまこの言葉は、${nq(c.word.now)}という意味で使われています。ところが、もとの意味は違いました。`),
      s(SECTION.kotoba, `${c.word.word}（${c.word.reading}）—— ${c.word.origin}`),
      s(
        SECTION.zure,
        `${nq(c.word.origin)}。それが今では、${nq(c.word.now)}。言葉は残って、中身だけが入れ替わりました。`,
      ),
      s(SECTION.watashi, `${conceptLine(c.concept)}　ここにつなげると、${c.concept.pivot}`),
      s(SECTION.otoshi, c.concept.step),
      s(
        SECTION.musubi,
        `毎日使っている言葉の中に、教えはもう入っていました。今日「${c.word.word}」と口にするとき、一度だけ立ち止まってみてください。`,
      ),
    ],
  }),

  kazoeru: (c) => ({
    title: `${c.primaryLabel}を、分けて数えてみる`,
    uses: { concept: true },
    meta: [],
    sections: [
      s(SECTION.iriguchi, c.modern.line),
      s(
        SECTION.hikkakari,
        `苦しいとき、私たちは全部をひとかたまりにして「もうだめだ」と言います。ところが仏教は、こういうときこそ分けて数えます。`,
      ),
      s(SECTION.kotoba, conceptLine(c.concept)),
      s(SECTION.zure, `${nq(c.concept.misread)}。実際には、${c.concept.pivot}`),
      s(SECTION.otoshi, `${nq(c.concept.step)}。紙に三行書くだけで、かたまりが少しほどけます。`),
      s(SECTION.musubi, `全部が苦しいのではありません。分けてみると、今日手をつけられるものが一つは残ります。`),
    ],
  }),

  'tatoe-swap': (c) => ({
    title: `${c.story.title}を、${c.modern.scene}で語る`,
    uses: { story: true, concept: true },
    meta: [c.story.point],
    sections: [
      s(SECTION.iriguchi, c.modern.line),
      s(SECTION.tatoe, `こういう話があります。${storyLine(c.story)}`),
      s(
        SECTION.zure,
        `二千年前の喩えですが、置き換えれば${c.modern.scene}の場面そのものです。道具が変わっただけで、私たちのつまずき方は変わっていません。`,
      ),
      s(SECTION.watashi, conceptLine(c.concept)),
      s(SECTION.otoshi, c.concept.step),
      s(SECTION.musubi, `${c.story.title}は、昔の話ではありませんでした。今朝の話です。`),
    ],
  }),

  toi: (c) => ({
    title: `問いからはじめる — ${c.primaryLabel}`,
    uses: { concept: true },
    meta: ['答えを先に言わない。沈黙を二拍置いてから次へ進む。'],
    sections: [
      s(SECTION.iriguchi, `今日は、はじめに一つだけ質問させてください。${c.modern.line}`),
      s(SECTION.toi, `そのとき、心は何を待っていたのでしょうか。答えは言わずに、少しだけ置いておきます。`),
      s(SECTION.hikkakari, c.concept.everyday),
      s(SECTION.kotoba, conceptLine(c.concept)),
      s(SECTION.zure, `${nq(c.concept.misread)}。けれども、${c.concept.pivot}`),
      s(SECTION.otoshi, c.concept.step),
      s(SECTION.musubi, `答えは申しません。問いを持ったままお帰りいただくのが、今日のおみやげです。`),
    ],
  }),

  ichigyo: (c) => ({
    title: `「${c.concept.term}」— ${c.concept.oneLine}`,
    uses: { concept: true, story: true },
    meta: [c.story.point],
    sections: [
      s(
        SECTION.iriguchi,
        `${c.concept.term}（${c.concept.reading}）。${c.concept.source}にある言葉です。今日はこの一行だけ、持って帰ってください。`,
      ),
      s(SECTION.hikkakari, `と言われても、ふだんの暮らしとは遠い言葉に聞こえます。たとえば、${c.modern.line}`),
      s(SECTION.zure, `${nq(c.concept.misread)}。ところが、${c.concept.pivot}`),
      s(SECTION.tatoe, `${c.story.title}という話があります。${storyLine(c.story)}`),
      s(SECTION.otoshi, c.concept.step),
      s(SECTION.musubi, `もう一度だけ。${c.concept.term}。${c.concept.oneLine}`),
    ],
  }),

  shippai: (c) => ({
    title: `私の失敗から — ${c.concept.term}`,
    uses: { concept: true },
    meta: ['冒頭の［　］に自分の失敗を入れる。教訓にせず、格好のつかないまま話し終えるほうが効く。'],
    sections: [
      s(
        SECTION.iriguchi,
        `お恥ずかしい話からはじめます。［ここに自分の失敗を一つ。${ownScene(c)}のような、誰にでもある場面で十分です］`,
      ),
      s(SECTION.hikkakari, `${c.modern.line}　私も、まったく同じところでつまずきました。`),
      s(SECTION.kotoba, conceptLine(c.concept)),
      s(SECTION.zure, `世間では、${nq(c.concept.misread)}。私も長いこと、そう思っていました。けれども、${c.concept.pivot}`),
      s(SECTION.otoshi, c.concept.step),
      s(
        SECTION.musubi,
        `えらそうなことは申せません。同じところでつまずいた者として、この言葉だけお渡しします。${c.concept.term}。`,
      ),
    ],
  }),

  gyakusetsu: (c) => ({
    title: `${c.concept.term} — がんばらないほうの話`,
    uses: { concept: true, story: true },
    meta: [c.story.point, '冒頭で言い切ってから理由を出す。順番を入れ替えると弱くなる。'],
    sections: [
      s(SECTION.iriguchi, `今日は少し、逆のことを言います。${c.modern.line}`),
      s(
        SECTION.hikkakari,
        `ふつうなら「もっと努力を」と言われる場面です。けれども、力の入れ方そのものが違っていることがあります。`,
      ),
      s(SECTION.tatoe, `${c.story.title}。${storyLine(c.story)}`),
      s(SECTION.kotoba, conceptLine(c.concept)),
      s(SECTION.zure, c.concept.pivot),
      s(SECTION.otoshi, c.concept.step),
      s(SECTION.musubi, `やめることで進むことがあります。${c.concept.term}とは、そういう言葉です。`),
    ],
  }),

  hanten: (c) => ({
    title: `世間の見方と、仏の見方 — ${c.modern.scene}`,
    uses: { concept: true, story: true },
    meta: [c.story.point, '二つの見方を並べるだけにして、どちらが正しいとは言わない。'],
    sections: [
      s(SECTION.iriguchi, c.modern.line),
      s(SECTION.seken, `世間はこう見ます。${c.concept.misread}`),
      s(
        SECTION.hotoke,
        `仏教はこう見ます。${c.concept.term}（${c.concept.reading}）—— ${c.concept.pivot}　【${c.concept.source}】`,
      ),
      s(SECTION.tatoe, `${c.story.title}。${storyLine(c.story)}`),
      s(SECTION.zure, `同じ出来事を見ているのに、立っている場所が違うだけで、これだけ変わります。`),
      s(SECTION.otoshi, c.concept.step),
      s(
        SECTION.musubi,
        `見方を変えましょう、という話ではありません。もう一つの見方がある、と知っているだけで、逃げ場が一つ増えます。`,
      ),
    ],
  }),

  gyoji: (c) => ({
    title: `${c.occasion.name}に寄せて — ${c.concept.term}`,
    uses: { concept: true, occasion: true },
    meta: [`行事の由来は一分以内で切り上げ、${c.modern.scene}の話に早めに移る。`],
    sections: [
      s(SECTION.iriguchi, `${c.occasion.name}の頃になりました。${c.occasion.hook}、という話から。`),
      s(SECTION.hikkakari, c.modern.line),
      s(SECTION.kotoba, conceptLine(c.concept)),
      s(SECTION.zure, `${nq(c.concept.misread)}。けれども、${c.concept.pivot}`),
      s(SECTION.otoshi, c.concept.step),
      s(
        SECTION.musubi,
        `${c.occasion.name}は、毎年めぐってきます。めぐってくるたびに、同じ言葉の意味が変わっていきます。`,
      ),
    ],
  }),

  itsuwa: (c) => ({
    title: `${c.story.title}`,
    uses: { story: true, concept: true },
    meta: [c.story.point, '解説を足したくなるところをこらえる。間を置いて終える。'],
    sections: [
      s(SECTION.iriguchi, `${c.modern.line}　その話をする前に、昔の話を一つ。`),
      s(SECTION.tatoe, storyLine(c.story)),
      s(SECTION.zure, `私たちも、${c.modern.scene}のたびに、この話と同じところに立っています。`),
      s(SECTION.watashi, conceptLine(c.concept)),
      s(SECTION.otoshi, c.concept.step),
      s(SECTION.musubi, `話はこれだけです。解説はしません。帰り道でふと思い出したら、それで十分です。`),
    ],
  }),

  shogyo: (c) => ({
    title: `「${short(c.phrase.text)}」に聞く`,
    uses: { concept: true, phrase: true },
    meta: [c.phrase.use],
    sections: [
      s(SECTION.shogyo, `${c.phrase.text}　【${c.phrase.source}】`),
      s(SECTION.iriguchi, `${c.modern.line}　この一句を、そこへ置いてみます。`),
      s(SECTION.hikkakari, c.phrase.gloss),
      s(SECTION.kotoba, conceptLine(c.concept)),
      s(SECTION.zure, `${nq(c.concept.misread)}。けれども、${c.concept.pivot}`),
      s(SECTION.otoshi, c.concept.step),
      s(SECTION.musubi, `もう一度、あの一句を。${c.phrase.text}`),
    ],
  }),

  ofumi: (c) => ({
    title: `御文をひらく — ${c.modern.scene}`,
    uses: { concept: true, phrase: true },
    meta: [c.phrase.use, '御文の本文は自坊の勤行本で確かめる。大谷派では「御文」、本願寺派では「御文章」。'],
    sections: [
      s(SECTION.iriguchi, `御文を一通、読ませていただきます。${c.phrase.text}　【${c.phrase.source}】`),
      s(SECTION.hikkakari, `いまの言葉にすると、${nq(c.phrase.gloss)}。そういうことだと思います。`),
      s(SECTION.zure, `${c.modern.line}　五百年前の手紙が、その場面をまっすぐに指しています。`),
      s(SECTION.kotoba, conceptLine(c.concept)),
      s(SECTION.otoshi, c.concept.step),
      s(SECTION.musubi, `あなかしこ、あなかしこ。`),
    ],
  }),

  tannisho: (c) => ({
    title: `歎異抄に聞く — ${c.primaryLabel}`,
    uses: { concept: true, phrase: true },
    meta: [c.phrase.use, '唯円の問いを借りて、聴き手が言えずにいることを先に口にする。'],
    sections: [
      s(SECTION.iriguchi, c.modern.line),
      s(SECTION.honne, `言いにくいことを、先に言ってしまいます。${c.concept.everyday}`),
      s(SECTION.shogyo, `${c.phrase.text}　【${c.phrase.source}】`),
      s(SECTION.hikkakari, c.phrase.gloss),
      s(SECTION.kotoba, conceptLine(c.concept)),
      s(SECTION.zure, `${nq(c.concept.misread)}。ところが、${c.concept.pivot}`),
      s(SECTION.otoshi, c.concept.step),
      s(SECTION.musubi, `同じ問いを持った人が、八百年前にもおりました。問いのほうは、まだ私に残っています。`),
    ],
  }),

  jitoku: (c) => ({
    title: `私の上に聞く — ${c.concept.term}`,
    uses: { concept: true },
    meta: ['真宗の法話は、説く形にすると途端に遠くなる。聞いている側の一人として話す。', '［　］に自分のこととして一つ入れる。'],
    sections: [
      s(SECTION.iriguchi, `${c.modern.line}　これは、よその話ではありません。`),
      s(SECTION.honne, `［ここに、${ownScene(c)}のどこで引っかかったのか、一言］`),
      s(SECTION.kotoba, conceptLine(c.concept)),
      s(SECTION.zure, `世間では、${nq(c.concept.misread)}。私も、ずっとそう思っていました。けれども、${c.concept.pivot}`),
      s(SECTION.otoshi, c.concept.step),
      s(
        SECTION.musubi,
        `説く側に立ったとたん、この一句は聞こえなくなります。私も、聞く側の一人としてここに座っています。`,
      ),
    ],
  }),

  gobyakudo: (c) => ({
    title: `「${c.word.word}」は、そういう意味ではありません`,
    uses: { word: true, concept: true },
    meta: [c.word.gap],
    sections: [
      s(SECTION.iriguchi, c.modern.line),
      s(SECTION.seken_tsukaikata, `「${c.word.word}」という言葉があります。世間では、${nq(c.word.now)}——そういう意味で使われています。`),
      s(SECTION.moto, `もとの意味は、${c.word.origin}`),
      s(SECTION.kotoba, conceptLine(c.concept)),
      s(SECTION.zure, `言葉だけが残って、中身が入れ替わりました。${c.concept.pivot}`),
      s(SECTION.otoshi, c.concept.step),
      s(SECTION.musubi, `言葉を直すだけの話ではありません。使い方が変わったところに、私たちの受け取り方が出ています。`),
    ],
  }),

  houonko: (c) => ({
    title: `${c.occasion.name}に — ${c.concept.term}`,
    uses: { concept: true, occasion: true },
    meta: ['供養ではなく報恩、という一点を外さない。由来の説明は短く。'],
    sections: [
      s(SECTION.iriguchi, `${c.occasion.name}のお勤めです。${c.occasion.hook}、というところから。`),
      s(SECTION.hikkakari, c.modern.line),
      s(SECTION.kotoba, conceptLine(c.concept)),
      s(SECTION.zure, `${nq(c.concept.misread)}。けれども、${c.concept.pivot}`),
      s(SECTION.otoshi, c.concept.step),
      s(
        SECTION.musubi,
        `${c.occasion.name}は、こちらが何かをして差し上げる日ではありません。受けていたことに気づかせていただく日です。`,
      ),
    ],
  }),

  ima: (c) => ({
    title: `${c.story.title} — ${c.concept.term}`,
    uses: { concept: true, story: true },
    meta: [
      c.story.point,
      'このたとえに出典はない。「たとえばの話ですが」で始めれば十分。自分の暮らしの一件に差し替えるともっとよい。',
    ],
    sections: [
      s(SECTION.iriguchi, c.modern.line),
      s(SECTION.tatoe, `たとえばの話ですが。${c.story.summary}`),
      s(
        SECTION.zure,
        `笑い話のようですが、ここで起きていることは、二千年前から言われてきたことと同じです。`,
      ),
      s(SECTION.kotoba, conceptLine(c.concept)),
      s(SECTION.hikkakari, `世間では、${nq(c.concept.misread)}。けれども、${c.concept.pivot}`),
      s(SECTION.otoshi, c.concept.step),
      s(
        SECTION.musubi,
        `${c.story.title}——その話をした、とだけ覚えて帰ってもらえれば十分です。言葉のほうは、あとからついてきます。`,
      ),
    ],
  }),

  hito: (c) => ({
    title: `${c.figure.name} — ${c.figure.title}`,
    uses: { concept: true, figure: true },
    meta: [`人物の話は、えらい方の話として語ると遠くなる。困っていた側の話として語る。`],
    sections: [
      s(SECTION.iriguchi, c.modern.line),
      s(SECTION.hito, `${figureLine(c.figure)}${c.figure.story}`),
      s(SECTION.zure, `${c.figure.hook}　えらい方だから乗り越えられた、という話ではありません。つまずいたところは、私たちと同じでした。`),
      s(SECTION.kotoba, conceptLine(c.concept)),
      s(SECTION.otoshi, c.concept.step),
      s(
        SECTION.musubi,
        `教えは、はじめから整った形であったのではありません。誰かが困ったところから、この言葉は出てきました。`,
      ),
    ],
  }),

  yurai: (c) => ({
    title: `${c.figure.everyday ?? c.figure.name}の向こうに — ${c.figure.name}`,
    uses: { concept: true, figure: true },
    meta: ['由来話は諸説ある。「と言われています」で止めて、断定しない。'],
    sections: [
      s(SECTION.iriguchi, c.modern.line),
      s(
        SECTION.yurai,
        `ところで、${c.figure.everyday ?? c.figure.title}。これが${c.figure.name}につながっていると申しましたら、意外に思われるでしょうか。`,
      ),
      s(SECTION.hito, `${figureLine(c.figure)}${c.figure.story}`),
      s(SECTION.zure, c.figure.hook),
      s(SECTION.kotoba, conceptLine(c.concept)),
      s(SECTION.otoshi, c.concept.step),
      s(
        SECTION.musubi,
        `身のまわりのものの出どころをたどると、たいてい誰かの困りごとに行き当たります。${c.figure.name}も、そこから始めた人でした。`,
      ),
    ],
  }),

  kojitsuke: (c) => ({
    title: `こじつけですが — 「${c.word.word}」と${c.concept.term}`,
    uses: { word: true, concept: true },
    meta: [c.word.gap, '強引さを隠さない。「こじつけです」と先に言ってしまうほうが笑いが出る。'],
    sections: [
      s(SECTION.iriguchi, c.modern.line),
      s(
        SECTION.hikkakari,
        `ここから少し強引にまいります。「${c.word.word}」という言葉があります。いまの意味は${nq(c.word.now)}。ところがもとは、${c.word.origin}`,
      ),
      s(SECTION.kotoba, conceptLine(c.concept)),
      s(SECTION.zure, `こじつけついでに言ってしまうと、${c.concept.pivot}`),
      s(SECTION.otoshi, c.concept.step),
      s(SECTION.musubi, `だいぶ無理をしました。それでも一つ覚えて帰ってもらえたら、今日はそれで十分です。`),
    ],
  }),
}

/** 掲示板やSNSに貼れる長さの一文を選ぶ（長い説明はそのままでは貼れない） */
function shortLine(text: string): string {
  const sentences = text
    .split(/(?<=。)/)
    .map((x) => nq(x.trim()))
    .filter((x) => x.length >= 10)
  if (sentences.length === 0) return nq(text)
  return sentences.reduce((a, b) => (b.length < a.length ? b : a))
}

/** 掲示板・SNS用に短く畳み直す（一行の案を複数出す） */
function condense(built: Built, c: Ctx): NetaSection[] {
  const hitokoto = [
    `${shortLine(c.concept.oneLine)}\n　　　　—— ${c.concept.term}`,
    `${shortLine(c.concept.pivot)}\n　　　　—— ${c.concept.term}`,
    `${c.word.word}——もとの意味は、${shortLine(c.word.origin)}\n　　　　—— 仏教語`,
  ]
    .map((t, i) => `［案${i + 1}］${t}`)
    .join('\n\n')
  const tanbun = `${c.modern.line}\n\n${c.concept.term}（${c.concept.reading}）。${c.concept.oneLine}\n${c.concept.pivot}\n\n${c.concept.step}`
  const shikomi = built.sections
    .filter((x) => x.label !== SECTION.iriguchi)
    .map((x) => x.body)
    .join('\n')
  return [
    s(SECTION.hitokoto, hitokoto),
    s(SECTION.tanbun, tanbun),
    s(SECTION.shikomi, shikomi),
  ]
}

/** 二つの並びを交互に混ぜる */
function interleave<T>(a: T[], b: T[]): T[] {
  const out: T[] = []
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (i < a.length) out.push(a[i])
    if (i < b.length) out.push(b[i])
  }
  return out
}

/** 絞り込んだ候補が空なら、全体に戻す */
const orAll = <T,>(narrowed: Ranked<T>[], all: Ranked<T>[]) => (narrowed.length > 0 ? narrowed : all)

function takeUnused<T extends { id: string }>(
  ranked: Ranked<T>[],
  used: Set<string>,
  rand: Rand,
  window = 6,
  /**
   * 同じ優先度の中での好み。前のものから順に試し、
   * まだ使っていない候補が残るあいだだけ効かせる。
   * 気持ち・書かれた文の一致より前に出してはいけない。
   */
  prefers: ((item: T) => boolean)[] = [],
): T {
  // 順番に見る。
  // 1) 書かれた文に当たった素材があるなら、1つでもそこからだけ選ぶ
  //    （気持ちのタグで穴埋めすると、書いた一件と無関係の言葉が混ざる）
  // 2) 無ければ、気持ちに当たった素材から
  //    （score ではなく match で見る。score には宗派の加点が入っているため）
  // 3) それも無ければ全体から
  const byText = ranked.filter((r) => r.hits > 0)
  const matched = ranked.filter((r) => r.match > 0)
  const tier = byText.length > 0 ? byText : matched.length > 0 ? matched : ranked
  // 好みは、この層の中だけで効かせる。
  // （層をまたいで絞ると、書いた一件や選んだ気持ちから外れた言葉が出る）
  let base = tier
  for (const prefer of prefers) {
    const narrowed = base.filter((r) => prefer(r.item))
    if (narrowed.some((r) => !used.has(r.item.id))) {
      base = narrowed
      break
    }
  }
  const freshBase = base.filter((r) => !used.has(r.item.id))
  // 当たっている素材が尽きたら、同じものを使い回してでも枠の外には出ない。
  // （気持ちに合わない素材を出すくらいなら、同じ言葉で切り口を変えるほうがよい）
  const source = freshBase.length > 0 ? freshBase : base
  const pool = source.slice(0, Math.max(window, 3))
  // 前のほうを引きやすくする（よく当たっている素材から先に出す）
  const i = Math.floor(pool.length * rand() * rand())
  const chosen = pool[Math.min(i, pool.length - 1)].item
  used.add(chosen.id)
  return chosen
}

/** 真宗大谷派モードでの素材の重みづけ（0で中立、負で後ろへ回す） */
// 宗派の優先は「同じくらい気持ちに合っているなら真宗を採る」程度に留める。
// 気持ちの一致（1つにつき10点）を超える加点にしてはいけない。
const TRADITION_BONUS: Record<TraditionMode, Record<Tradition, number>> = {
  otani: { shinshu: 4, common: 0, zen: -3 },
  any: { shinshu: 0, common: 0, zen: 0 },
}

function weighTradition<T extends { tradition?: Tradition }>(
  ranked: Ranked<T>[],
  mode: TraditionMode,
): Ranked<T>[] {
  const bonus = TRADITION_BONUS[mode]
  return ranked
    .map((r) => ({ ...r, score: r.score + bonus[r.item.tradition ?? 'common'] }))
    .sort((a, b) => b.score - a.score)
}

/**
 * 真宗の切り口には真宗の素材を当てる。ただし気持ちに当たっているものに限る。
 * 当たっている真宗の素材が無ければ、宗派より気持ちの一致を採る。
 * （ここで真宗を優先しすぎると、「イライラする」に死に際の話が出る）
 */
const preferShinshu = <T extends { tradition?: Tradition }>(ranked: Ranked<T>[]) => {
  // 書かれた文や話題の型に当たっている素材があるときは、宗派より、そちらを優先する
  if (ranked.some((r) => r.hits > 0)) return ranked
  const fit = ranked.filter((r) => r.item.tradition === 'shinshu' && r.match > 0)
  // 当たっている真宗の素材が少ないと、そればかり繰り返し並ぶので宗派の縛りを外す。
  // （ひと回し6案に対して、2つでは足りない）
  return fit.length >= 3 ? fit : ranked
}

/** 真宗モードの結びに添える一句 */
const OTANI_CLOSINGS = [
  '南無阿弥陀仏。',
  'なんまんだぶ、なんまんだぶ。',
  'ようこそのお聴聞でございました。',
]

function mannerFor(scene: Scene, rand: Rand): Manner {
  const fit = MANNERS.filter((m) => !m.scenes || m.scenes.includes(scene.id))
  const pool = fit.length > 0 ? fit : MANNERS
  return pool[Math.floor(rand() * pool.length) % pool.length]
}

export function generateNeta(input: GenerateInput): Neta[] {
  const rand = mulberry32(
    input.seed ^ hashString(input.text + input.emotions.join(',') + (input.reasonIds ?? []).join(',')),
  )
  const scene = SCENE_BY_ID[input.sceneId] ?? SCENE_BY_ID.howakai
  const mode = input.tradition

  // 「なんで？」で選んだ理由を、気持ちに足し込む。
  // 理由に紐づく仏教語は、とくに当たりやすいものとして前に出す。
  const reasons = (input.reasonIds ?? []).map((id) => REASON_BY_ID[id]).filter(Boolean)
  const emotions = Array.from(
    new Set([...input.emotions, ...reasons.flatMap((r) => r.emotions)]),
  )
  // 理由（なんで？）に紐づく言葉は、前に出す程度の重みにする
  const preferred = new Set(reasons.flatMap((r) => r.concepts ?? []))

  // 今日の話の大きさ。入口の桁に、仏教語の桁を合わせる。
  const target = targetScale(input.scale ?? 'auto', input.text, emotions, scene)
  // 目盛りが1つ違うところまでは使う（ぴったりに絞ると、同じ言葉ばかりになる）
  const okScale = (c: Concept) => Math.abs((c.scale ?? 2) - target) <= 1

  const emotionLabels = input.emotions.map((id) => EMOTION_BY_ID[id]?.label).filter(Boolean)
  const reasonLabels = reasons.map((r) => r.label)
  const primaryLabel = emotionLabels[0] ?? 'そのざわつき'

  const rankedConcepts = weighTradition(
    rankItems(
      CONCEPTS,
      emotions,
      input.text,
      (x) => x.emotions,
      (x) => [x.term, ...(x.keywords ?? [])],
    ),
    mode,
  )
  const rankedStories = weighTradition(
    rankItems(
      STORIES,
      emotions,
      input.text,
      (x) => x.emotions,
      (x) => [x.title, ...(x.keywords ?? [])],
    ),
    mode,
  )
  const rankedWords = weighTradition(
    rankItems(
      WORDS,
      emotions,
      input.text,
      (x) => x.emotions,
      (x) => [x.word],
    ),
    mode,
  )
  const rankedFigures = weighTradition(
    rankItems(
      FIGURES,
      emotions,
      input.text,
      (x) => x.emotions,
      (x) => [x.name, x.everyday ?? '', ...(x.keywords ?? [])],
    ),
    mode,
  )
  const rankedModerns = rankItems(
    MODERNS.filter((m) => !(m.avoidScenes ?? []).includes(scene.id)),
    emotions,
    input.text,
    (x) => x.emotions,
    (x) => [x.scene, ...(x.keywords ?? [])],
  )
  const rankedPhrases = rankItems(
    PHRASES,
    emotions,
    input.text,
    (x) => x.emotions,
    (x) => [x.text, x.source],
  )

  const monthly = OCCASIONS.filter((o) => o.months.includes(input.month))
  const occasionPool = monthly.length > 0 ? monthly : OCCASIONS
  const occasions = weighTradition(
    occasionPool.map((item) => ({ item, score: 0, match: 0, hits: 0 })),
    mode,
  )

  // 切り口を名指しされたら、こじつけ度や宗派の絞り込みより指定を優先する
  const pins = input.pins ?? {}
  const pinnedAngle = pins.angleId ? ANGLES.find((a) => a.id === pins.angleId) : undefined
  // 御文・歎異抄の切り口は、その出典に気持ちへ当たる一句があるときだけ出す。
  // （無いまま出すと、話の筋と関係のない一句を読み上げることになる）
  const hasFitPhrase = (source: string) =>
    emotions.length === 0 ||
    rankedPhrases.some((r) => r.match > 0 && r.item.source.includes(source))
  const PHRASE_SOURCE: Record<string, string> = { ofumi: '御文', tannisho: '歎異抄' }
  // 「身のまわりの出どころ」は、暮らしの品に結びつく人物が気持ちに当たるときだけ。
  // （無いまま出すと、由来の無い人物を由来話として語ることになる）
  // 通夜・死別の場で「解約し忘れたサブスク」の話はしない。
  // ここは好みではなく、候補から外す。喩えは背骨ではないので、外しても筋は立つ。
  const usableStories =
    target === 3 ? rankedStories.filter((r) => r.item.kind !== '今の話') : rankedStories

  // 「今のたとえで」は、いまの暮らしの見立てが気持ちに当たるときだけ。
  const hasFitParable =
    target <= 2 &&
    rankedStories.some(
      (r) => r.item.kind === '今の話' && (emotions.length === 0 || r.match > 0 || r.hits > 0),
    )
  const hasFitFigure =
    emotions.length === 0 || rankedFigures.some((r) => r.match > 0 && r.item.everyday)

  const usable = pinnedAngle
    ? [pinnedAngle]
    : ANGLES.filter(
        (a) =>
          a.kojitsuke <= input.kojitsukeMax &&
          (mode === 'otani' || a.tradition !== 'shinshu') &&
          (!PHRASE_SOURCE[a.id] || hasFitPhrase(PHRASE_SOURCE[a.id])) &&
          (a.id !== 'yurai' || hasFitFigure) &&
          (a.id !== 'ima' || hasFitParable),
      )
  // 一句を名指しされたら、その一句を読む切り口を回す（無ければ通常どおり）
  const phraseAngles = usable.filter((a) => ['shogyo', 'ofumi', 'tannisho'].includes(a.id))
  const angles = pins.phraseId && !pinnedAngle && phraseAngles.length > 0
    ? shuffle(phraseAngles, rand)
    : mode === 'otani'
      ? // 真宗の切り口と、宗派を問わない切り口を交互に。
        // 真宗の切り口で固めると、真宗の言葉のうち気持ちに合うものが少ないときに
        // 同じ言葉ばかりが並んでしまうため。
        interleave(
          shuffle(usable.filter((a) => a.tradition === 'shinshu'), rand),
          shuffle(usable.filter((a) => a.tradition !== 'shinshu'), rand),
        )
      : shuffle(usable, rand)

  const rankedConceptsByReason =
    preferred.size > 0
      ? rankedConcepts
          .map((r) =>
            preferred.has(r.item.id)
              ? { ...r, score: r.score + 12, match: Math.max(r.match, 1) }
              : r,
          )
          .sort((a, b) => b.score - a.score)
      : rankedConcepts

  // 自分で書いた一件があるなら、それが入口。内蔵の場面で置き換えない。
  const typed = input.text.trim().replace(/\s+/g, ' ')
  const typedModern: Modern | null = typed
    ? {
        id: 'typed',
        scene: 'ご自身の一件',
        omoi: 'ご自身が書かれた一件。',
        line: /[。！？…]$/.test(typed)
          ? typed.length > 160
            ? `${typed.slice(0, 160)}…`
            : typed
          : `${typed.length > 160 ? `${typed.slice(0, 160)}…` : typed}。`,
        emotions: [...emotions],
      }
    : null

  // ひと回しの中で、同じ大きさの話ばかりにしない。
  // （真宗モードでは救い・往生の語がまとめて上位に来るので、
  //   放っておくと6案すべてが「いのちの話」になる）
  const scalesInPlay = ([1, 2, 3] as const).filter((sc) =>
    rankedConcepts.some((r) => (r.item.scale ?? 2) === sc && Math.abs(sc - target) <= 1),
  )
  const scaleCap = Math.max(1, Math.ceil(input.count / Math.max(1, scalesInPlay.length)))
  const scaleUsed = new Map<number, number>()

  // 今の暮らしからのたとえ（スマホの充電、解約し忘れたサブスク…）は、
  // 置き換えの一手間がいらないぶん、そのまま通じる。
  // ただし、ひと回しが全部それになると軽くなるので半分まで。
  // 通夜や死別の話（大きさ3）では出さない。場に合わない。
  const parableCap = Math.max(1, Math.ceil(input.count / 2))
  let parableUsed = 0
  const preferModernParable = target <= 2

  const usedConcept = new Set<string>()
  const usedStory = new Set<string>()
  const usedWord = new Set<string>()
  const usedFigure = new Set<string>()
  const usedModern = new Set<string>()
  const usedOccasion = new Set<string>()
  const usedPhrase = new Set<string>()

  const out: Neta[] = []
  for (let i = 0; i < input.count; i++) {
    const angle: Angle = angles[i % angles.length]
    const shinshuAngle = angle.tradition === 'shinshu'

    // 真宗の切り口には真宗の素材を当てる（足りなければ全体から）
    const conceptPool = shinshuAngle
      ? preferShinshu(rankedConceptsByReason)
      : rankedConceptsByReason
    // 話の大きさは「好み」であって、絞り込みではない。
    // 書かれた文や選んだ気持ちに当たっている言葉を、桁が違うからといって外さない。
    // 1) 桁が合っていて、その桁をまだ使いきっていないもの
    // 2) 桁が合っているもの
    const scalePrefs = [
      (c: Concept) =>
        okScale(c) && (scaleUsed.get(c.scale ?? 2) ?? 0) < scaleCap,
      okScale,
    ]
    const wordPool = shinshuAngle ? preferShinshu(rankedWords) : rankedWords
    const storyPool =
      angle.id === 'ima'
        ? orAll(usableStories.filter((r) => r.item.kind === '今の話'), usableStories)
        : shinshuAngle
          ? preferShinshu(usableStories)
          : usableStories
    // 由来の切り口では、暮らしの品に結びつく人物だけを引く
    const figurePool =
      angle.id === 'yurai'
        ? orAll(rankedFigures.filter((r) => r.item.everyday), rankedFigures)
        : shinshuAngle
          ? preferShinshu(rankedFigures)
          : rankedFigures
    const occasionPoolForAngle = shinshuAngle
      ? orAll(
          occasions.filter((r) => r.item.tradition === 'shinshu'),
          occasions,
        )
      : occasions

    // 御文・歎異抄の切り口は、その出典の一句だけを引く
    const phrasePool =
      angle.id === 'ofumi'
        ? rankedPhrases.filter((r) => r.item.source.includes('御文'))
        : angle.id === 'tannisho'
          ? rankedPhrases.filter((r) => r.item.source.includes('歎異抄'))
          : rankedPhrases

    const pinnedConcept = pins.conceptId ? CONCEPT_BY_ID[pins.conceptId] : undefined
    const concept = pinnedConcept ?? takeUnused(conceptPool, usedConcept, rand, 8, scalePrefs)
    const usedScale = concept.scale ?? 2
    scaleUsed.set(usedScale, (scaleUsed.get(usedScale) ?? 0) + 1)
    // 一句・喩え・日常語は、選んだ教義と同じ気持ちを向いているものから引く（話の筋がずれないように）
    const conceptTags = new Set(concept.emotions)
    const alignTo = <T extends { emotions: readonly EmotionId[] }>(pool: Ranked<T>[]) =>
      pool
        .map((r) => ({
          ...r,
          score: r.score + r.item.emotions.filter((e) => conceptTags.has(e)).length * 4,
        }))
        .sort((a, b) => b.score - a.score)

    // 入口・たとえ・人物は、選んだ言葉と同じ話題のものから引く。
    // 気持ちのタグだけでつなぐと、〈自己嫌悪〉という一語で
    // 「鏡に映った自分」と「他力本願」と「解約し忘れたサブスク」が
    // 同じ話にされてしまう。話題が合っていないと、①②⑤が別々の話になる。
    const conceptTopics = new Set<TopicId>(concept.topics ?? [])
    const sameTopic = (x: { topics?: TopicId[] }) =>
      conceptTopics.size === 0 || (x.topics ?? []).some((tp) => conceptTopics.has(tp))

    const ctx: Ctx = {
      emotionLabels,
      primaryLabel,
      userText: input.text,
      // 入口も、選んだ教義と同じ気持ちのものに寄せる
      modern:
        (pins.modernId === 'typed' ? typedModern : undefined) ??
        (pins.modernId ? MODERN_BY_ID[pins.modernId] : undefined) ??
        (pins.modernId ? undefined : typedModern) ??
        takeUnused(alignTo(rankedModerns), usedModern, rand, 8, [sameTopic]),
      concept,
      story:
        (pins.storyId ? STORY_BY_ID[pins.storyId] : undefined) ??
        takeUnused(alignTo(storyPool), usedStory, rand, 6, [
          // 1) 話題が合っていて、いまの register にも合うたとえ
          // 2) 話題が合っているたとえ
          // 3) register だけ合うたとえ
          (st: Story) =>
            sameTopic(st) &&
            (preferModernParable
              ? st.kind === '今の話' && parableUsed < parableCap
              : st.kind !== '今の話'),
          sameTopic,
          preferModernParable
            ? (st: Story) => st.kind === '今の話' && parableUsed < parableCap
            : (st: Story) => st.kind !== '今の話',
        ]),
      figure:
        (pins.figureId ? FIGURE_BY_ID[pins.figureId] : undefined) ??
        takeUnused(alignTo(figurePool), usedFigure, rand, 6, [sameTopic]),
      // 同じ語が仏教語にも日常語にもあると「こじつけですが —「縁起」と縁起」が出る。
      // 同名は外す（外して空になるときだけ元に戻す）。
      word:
        (pins.wordId ? WORD_BY_ID[pins.wordId] : undefined) ??
        takeUnused(
          alignTo(orAll(wordPool.filter((r) => r.item.word !== concept.term), wordPool)),
          usedWord,
          rand,
          6,
        ),
      occasion: takeUnused(occasionPoolForAngle, usedOccasion, rand, 6),
      phrase:
        (pins.phraseId ? PHRASE_BY_ID[pins.phraseId] : undefined) ??
        takeUnused(alignTo(orAll(phrasePool, rankedPhrases)), usedPhrase, rand, 4),
      scene,
      mode,
    }

    if (ctx.story.kind === '今の話') parableUsed++

    const built = BUILDERS[angle.id](ctx)
    const manner = mannerFor(scene, rand)
    const meta = [
      ...built.meta,
      `避けたい入り方：「${ctx.concept.term}とは——こういう意味です」と解説から始めると、そこで顔が下がります。今日の入口は「${ctx.modern.scene}」です。`,
      ...(mode === 'otani'
        ? [`大谷派の言い回し：「${manner.avoid}」ではなく「${manner.use}」。${manner.why}`]
        : []),
      scene.minutes === 0
        ? `${scene.label}：一行で立ち止まらせる。説明はしない。`
        : `${scene.label}：目安${scene.minutes}分。${scene.note}。`,
    ]

    // 真宗モードでは、結びにお念仏の一句を添える
    const spoken =
      mode === 'otani' && scene.minutes > 0
        ? built.sections.map((sec) =>
            sec.label === SECTION.musubi && !sec.body.includes('あなかしこ')
              ? s(sec.label, `${sec.body}\n\n${OTANI_CLOSINGS[Math.floor(rand() * OTANI_CLOSINGS.length) % OTANI_CLOSINGS.length]}`)
              : sec,
          )
        : built.sections

    const sections =
      scene.minutes === 0 ? condense(built, ctx) : [...spoken, s(SECTION.memo, meta.join('\n'))]

    const sources: string[] = []
    const cautions: string[] = []
    if (built.uses.concept) {
      sources.push(`${ctx.concept.term}：${ctx.concept.source}`)
      if (ctx.concept.caution) cautions.push(`${ctx.concept.term}：${ctx.concept.caution}`)
    }
    if (built.uses.story) {
      sources.push(`${ctx.story.title}：${ctx.story.source}`)
      if (ctx.story.caution) cautions.push(`${ctx.story.title}：${ctx.story.caution}`)
    }
    if (built.uses.word) {
      sources.push(`${ctx.word.word}：仏教語（${ctx.word.origin}）`)
      if (ctx.word.caution) cautions.push(`${ctx.word.word}：${ctx.word.caution}`)
    }
    if (built.uses.figure) {
      sources.push(`${ctx.figure.name}：${ctx.figure.era}`)
      if (ctx.figure.caution) cautions.push(`${ctx.figure.name}：${ctx.figure.caution}`)
    }
    if (built.uses.phrase) {
      sources.push(`一句：${ctx.phrase.source}`)
      if (ctx.phrase.caution) cautions.push(`一句：${ctx.phrase.caution}`)
    }
    if (built.uses.occasion && ctx.occasion.caution) {
      cautions.push(`${ctx.occasion.name}：${ctx.occasion.caution}`)
    }

    // 一覧で見比べるための要点。
    // ラベルを並べるのではなく、上から読めば筋が通る順に並べる。
    const modernAlts = alignTo(rankedModerns)
      .slice(0, 6)
      .map((r) => r.item.id)
      .filter((id) => id !== ctx.modern.id)
    const angleAlts = usable.map((x) => x.id).filter((id) => id !== angle.id)

    const todayStep = ctx.concept.step.startsWith('今日')
      ? `だから、${nq(ctx.concept.step)}。`
      : `だから今日は、${nq(ctx.concept.step)}。`

    const steps: string[] = [
      ...(built.uses.occasion
        ? [`${ctx.occasion.name}の頃です。${nq(ctx.occasion.hook)}、というところから。`]
        : []),
      `${ctx.modern.line}　${nq(ctx.concept.everyday)}。`,
      ...(built.uses.phrase
        ? [`ここで一句。「${ctx.phrase.text}」（${ctx.phrase.source}）＝${nq(ctx.phrase.gloss)}。`]
        : []),
      ...(built.uses.word
        ? [`じつは「${ctx.word.word}」は仏教の言葉です。${ctx.word.origin}`]
        : []),
      `仏教はこれを「${ctx.concept.term}」という。${nq(ctx.concept.oneLine)}。`,
      `世間では${nq(ctx.concept.misread)}。けれども、${ctx.concept.pivot}`,
      ...(built.uses.figure
        ? [
            ctx.figure.everyday
              ? `${ctx.figure.everyday}の出どころは${ctx.figure.name}。${nq(ctx.figure.title)}、という人だった。`
              : `${ctx.figure.name}にも、同じところでのつまずきがある。${nq(ctx.figure.title)}。`,
          ]
        : []),
      // 題が述語で終わるたとえ（「たたんだそばから崩される」）もあるので、かぎ括弧で括る
      ...(built.uses.story ? [`「${ctx.story.title}」の話が、そこに重なる。`] : []),
      todayStep,
    ]

    const digest = {
      summary:
        emotionLabels.length > 0
          ? `${emotionLabels.join('・')}${
              reasonLabels.length > 0 ? `（${reasonLabels.join('・')}）` : ''
            }——というときに。${ctx.concept.oneLine}`
          : ctx.concept.oneLine,
      steps,
      note: `入口：${
        ctx.modern.id === 'typed' ? 'ご自身が書いた一件' : `${ctx.modern.scene}（ご自身の一件に差し替え可）`
      }／${scene.minutes === 0 ? scene.label : `${scene.label}・${scene.minutes}分`}`,
    }

    const tradition: Tradition = shinshuAngle
      ? 'shinshu'
      : (built.uses.concept ? ctx.concept.tradition : undefined) ?? 'common'

    out.push({
      id: `${input.seed}-${i}-${angle.id}`,
      angleId: angle.id,
      angleName: angle.name,
      aim: ANGLE_BY_ID[angle.id].aim,
      kojitsuke: angle.kojitsuke,
      title: scene.minutes === 0 ? `${ctx.concept.term} — ${ctx.modern.scene}` : built.title,
      sections,
      digest,
      alternatives: { modernIds: [ctx.modern.id, ...modernAlts], angleIds: [angle.id, ...angleAlts] },
      sources,
      cautions,
      materials: {
        conceptId: built.uses.concept ? ctx.concept.id : undefined,
        storyId: built.uses.story ? ctx.story.id : undefined,
        wordId: built.uses.word ? ctx.word.id : undefined,
        figureId: built.uses.figure ? ctx.figure.id : undefined,
        modernId: ctx.modern.id,
        modernScene: ctx.modern.scene,
        modernLine: ctx.modern.line,
        occasionId: built.uses.occasion ? ctx.occasion.id : undefined,
        phraseId: built.uses.phrase ? ctx.phrase.id : undefined,
      },
      minutes: scene.minutes,
      tradition,
    })
  }
  return out
}

/** 条件はそのままに、入口の場面／切り口だけを次の候補に入れ替える */
export function swapMaterial(
  neta: Neta,
  base: Omit<GenerateInput, 'pins' | 'count' | 'seed'>,
  kind: 'modern' | 'angle',
  seed: number,
): Neta {
  const alts = kind === 'modern' ? neta.alternatives?.modernIds : neta.alternatives?.angleIds
  if (!alts || alts.length < 2) return neta
  const current = kind === 'modern' ? neta.materials.modernId : neta.angleId
  const next = alts[(Math.max(0, alts.indexOf(current ?? '')) + 1) % alts.length]

  const pins: Pins = {
    angleId: kind === 'angle' ? next : neta.angleId,
    modernId: kind === 'modern' ? next : neta.materials.modernId,
    conceptId: neta.materials.conceptId,
    storyId: neta.materials.storyId,
    wordId: neta.materials.wordId,
    figureId: neta.materials.figureId,
    phraseId: neta.materials.phraseId,
  }
  const [out] = generateNeta({ ...base, seed, count: 1, pins })
  return {
    ...out,
    id: `${neta.id}-${kind}${seed}`,
    // 候補の並びは元のものを保って、押すたびに順に回るようにする
    alternatives: neta.alternatives,
  }
}

export type { Concept, Story, Word, Figure, Modern, Phrase, Manner, Scene }
