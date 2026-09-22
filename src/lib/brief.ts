import { CONCEPT_BY_ID } from '../data/concepts'
import { EMOTION_BY_ID } from '../data/emotions'
import { FIGURE_BY_ID } from '../data/figures'
import { MODERN_BY_ID } from '../data/modern'
import { PHRASE_BY_ID } from '../data/shinshu/phrases'
import { STORY_BY_ID } from '../data/stories'
import { TOPIC_BY_ID } from '../data/topics'
import type { Neta } from '../data/types'
import { WORD_BY_ID } from '../data/words'
import type { SavedNeta } from './storage'

/**
 * ネタ帳の素材を、AIに読ませて法話に成形してもらうための指示書にする。
 *
 * このアプリは文章を組み立てない（組み合わせでは筋が通らないため）。
 * 代わりに、素材と守ってほしいことを一枚にまとめて渡す。書くのは向こう側。
 *
 * いちばん大事なのは「作らせない」ための縛り。
 * 仏教の素材をAIに渡すと、もっともらしい出典や逸話をこしらえる。
 * 出典はここに書かれたものだけ、と先に釘を刺しておく。
 */

export type BriefForm = 'toi' | 'kishou' | 'omakase'

export const BRIEF_FORMS: { id: BriefForm; label: string; note: string }[] = [
  { id: 'toi', label: '問いから', note: '問いで入り、答えを渡さずに終える' },
  { id: 'kishou', label: '起承転結', note: '場面から入り、ひっくり返して、暮らしへ戻す' },
  { id: 'omakase', label: '型はまかせる', note: '素材に合う形で書いてもらう' },
]

export type BriefOptions = {
  form: BriefForm
  /** 目安の尺（分）。0 は掲示板・SNSの短文 */
  minutes: number
  /** 真宗大谷派の作法に合わせるか */
  otani: boolean
}

export const DEFAULT_BRIEF: BriefOptions = { form: 'toi', minutes: 5, otani: true }

const FORM_BODY: Record<BriefForm, string> = {
  toi: [
    '① その場面 — 情景をそのまま置く。説明しない',
    '② 問い — 聴き手の言葉で、ひとつだけ。ここで答えを言わない',
    '③ 間 — 黙るところ。本文には書かず、［間］とだけ示す',
    '④ 世間の答え — その問いに世間がどう答えているか',
    '⑤ 手がかり — 仏教の言葉を出す。出したら必ず日常の言葉に置き換える',
    '⑥ 問いに戻す — ②と同じ問いに戻る。答えは渡さない',
    '⑦ 今日の一歩 — 聴き手が今日できることを一つ',
  ].join('\n'),
  kishou: [
    '起 — 情景をそのまま置く',
    '承 — そこで何が起きているか。世間の受け取り方',
    '転 — 仏教から見るとどうか。落差を見せる',
    '結 — 暮らしへ戻す。今日できることを一つ',
  ].join('\n'),
  omakase: '素材に合う形で。ただし、教義の説明から始めないこと。',
}

const line = (label: string, v: string | undefined | null) => (v ? `- ${label}：${v}` : '')

/** 一件ぶんの素材を書き出す */
function materials(neta: Neta): string[] {
  const m = neta.materials
  const c = m.conceptId ? CONCEPT_BY_ID[m.conceptId] : undefined
  const p = m.phraseId ? PHRASE_BY_ID[m.phraseId] : undefined
  const f = m.figureId ? FIGURE_BY_ID[m.figureId] : undefined
  const st = m.storyId ? STORY_BY_ID[m.storyId] : undefined
  const w = m.wordId ? WORD_BY_ID[m.wordId] : undefined
  const mo = m.modernId ? MODERN_BY_ID[m.modernId] : undefined
  const scene = m.modernScene ?? mo?.scene
  const lead = m.modernLine ?? mo?.line

  const out: string[] = []
  if (c) {
    out.push(
      '#### 仏教の言葉',
      line('言葉', `${c.term}（${c.reading}）`),
      line('一行で', c.oneLine),
      line('答えている問い', c.question),
      line('暮らしの言い換え', c.everyday),
      line('世間での受け取り', c.misread),
      line('そこからのズレ', c.pivot),
      line('今日の一歩', c.step),
      line('出典', c.source),
    )
  }
  if (p) {
    out.push(
      '#### お聖教の一節',
      line('本文', p.text),
      line('読み', p.reading),
      line('意味', p.gloss),
      line('使いどころ', p.use),
      line('出典', p.source),
    )
  }
  if (f) {
    out.push(
      '#### 人物',
      line('名', `${f.name}（${f.era}）`),
      line('通り名', f.title),
      line('話', f.story),
      line('使いどころ', f.hook),
      line('暮らしとの接点', f.everyday),
    )
  }
  if (st) {
    out.push(
      '#### たとえ・逸話',
      line('題', `${st.title}（${st.kind}）`),
      line('話', st.summary),
      line('使いどころ', st.point),
      line('出典', st.source),
    )
  }
  if (w) {
    out.push(
      '#### 日常語のもと',
      line('語', `${w.word}（${w.reading}）`),
      line('いまの意味', w.now),
      line('もとの意味', w.origin),
      line('ズレ', w.gap),
    )
  }
  if (scene || lead) {
    out.push(
      '#### 情景',
      line('場面', scene),
      line('語り出しに使える一文', lead),
      line('そこで人が思っていること', mo?.omoi),
    )
  }
  // なぜこの言葉とこの情景が並んでいるのか。
  // ここを渡さないと、AIの側でも二つが別々の話のままになる。
  const shared = (c?.topics ?? []).filter((tp) => (mo?.topics ?? []).includes(tp))
  if (shared.length > 0) {
    out.push('#### この言葉と、この情景が重なるところ')
    for (const id of shared) {
      const tp = TOPIC_BY_ID[id]
      if (!tp) continue
      out.push(`- 〈${tp.label}〉この場面では、${tp.scene}／この言葉は、${tp.teaching}`)
    }
    out.push('- この二つのあいだを、どう渡すか。そこを書いてください')
  }
  return out.filter(Boolean)
}

function one(item: SavedNeta, i: number, many: boolean): string {
  const { neta, memo } = item
  const head = many ? `### 素材${i + 1}：${neta.title}` : `### ${neta.title}`
  const body = neta.sections
    .filter((s) => !s.label.startsWith('演出メモ'))
    .map((s) => `**${s.label}**\n${s.body}`)
    .join('\n\n')
  const emotions = item.fromEmotions
    .map((e) => EMOTION_BY_ID[e]?.label ?? e)
    .filter(Boolean)
    .join('・')
  return [
    head,
    ...materials(neta),
    '',
    '#### この案の形（参考。作り直してかまいません）',
    body,
    '',
    memo.trim() ? `#### 語り手のメモ（いちばん大事。ここを芯にしてください）\n${memo.trim()}` : '',
    item.fromText.trim() ? `#### もとになった一件\n${item.fromText.trim()}` : '',
    emotions ? `#### そのときの気持ち\n${emotions}` : '',
    neta.sources.length ? `#### 出典（引用してよいのはこの範囲だけ）\n${neta.sources.map((s) => `- ${s}`).join('\n')}` : '',
    neta.cautions.length ? `#### 語る前に確認\n${neta.cautions.map((s) => `- ${s}`).join('\n')}` : '',
  ]
    .filter((x) => x !== '')
    .join('\n')
}

/** AIに渡す一枚。これをそのまま貼れば、法話の下書きが返ってくる形にする */
export function toAIBrief(items: SavedNeta[], opts: BriefOptions = DEFAULT_BRIEF): string {
  if (items.length === 0) return '# 法話の下書きをお願いします\n\n素材がありません。\n'
  const many = items.length > 1
  const length =
    opts.minutes === 0
      ? '掲示板やSNSに貼れる長さ（一行の案を3つと、200字ほどの短文を1つ）'
      : `話して約${opts.minutes}分（${opts.minutes * 300}字前後）`

  const rules = [
    '- 教義の説明から始めない。聴き手がいる場面から始める',
    '- 仏教の言葉を出したら、必ずその場で日常の言葉に置き換える',
    '- **出典は、下に書かれているものだけを使う。** ほかの経典・逸話・人物の話を足さない',
    '- **書かれていない事実（年号・人物・逸話・引用）を作らない。** 確かでないことは「と言われています」で止める',
    '- ふだんの話し言葉で。「〜であります」「〜と申しましても」のような硬い言い回しは避ける',
    '- 聴き手を責めない。語り手も同じところでつまずく一人として書く',
    ...(opts.otani
      ? [
          '- 真宗大谷派の作法に合わせる。「ご冥福」「追善供養」「草葉の陰」「浮かばれない」「御霊前」は使わない',
          '- 亡き方を「供養する」ではなく、受けていたことに気づく（報恩）という形にする',
        ]
      : []),
    many ? '- 下の素材を一本にまとめる。全部を詰め込まず、軸になる一つを決めて、ほかは支えに回す' : '',
  ].filter(Boolean)

  return [
    '# 法話の下書きをお願いします',
    '',
    'あなたは、日本の僧侶の下ごしらえを手伝う書き手です。',
    `下の素材をもとに、法話の下書きを一本書いてください。${length}。`,
    '',
    '## 守ってほしいこと',
    rules.join('\n'),
    '',
    '## 組み立て',
    FORM_BODY[opts.form],
    '',
    '## 素材',
    items.map((x, i) => one(x, i, many)).join('\n\n---\n\n'),
    '',
    '## 書き終えたら',
    '- 最後に、使った出典を箇条書きで並べてください',
    '- 自信のないところ（言い切れないこと）があれば、本文のあとに「確かめてほしいところ」として挙げてください',
    '',
  ].join('\n')
}
