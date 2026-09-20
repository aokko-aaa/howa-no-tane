import type { EmotionId } from './types'

// 「たどる」= お坊さんでない人が、自分の気持ちから話にたどり着くためのチャート。
// 仏教語を一つも使わずに選べることを優先している。

export type Step1 = { id: string; label: string; emotions: EmotionId[] }
export type Step2 = { id: string; label: string; emotions: EmotionId[] }
export type Shape = 'kotoba' | 'wake' | 'shizuka' | 'warai'
export type Step3 = { id: Shape; label: string; note: string }

export const STEP1: Step1[] = [
  { id: 'mm', label: 'もやもやする・腹が立つ', emotions: ['iraira', 'ningenkankei', 'urami'] },
  { id: 'fuan', label: '不安で落ち着かない', emotions: ['fuan', 'aseri', 'okane'] },
  { id: 'ochi', label: '落ち込んでいる・自信がない', emotions: ['ochikomi', 'jikokeno', 'koukai'] },
  { id: 'sabi', label: 'さびしい・ひとりだ', emotions: ['kodoku', 'munashisa'] },
  { id: 'urayam', label: '人がうらやましい', emotions: ['shitto', 'hikaku', 'shounin'] },
  { id: 'tsukare', label: 'つかれた・もう無理', emotions: ['tsukare', 'isogashii', 'mukuwarenai'] },
  { id: 'kanashi', label: 'かなしい・会えない人がいる', emotions: ['wakare', 'shi', 'zaiakukan'] },
  { id: 'ureshi', label: 'うれしい・ありがたい', emotions: ['yorokobi', 'kansha', 'tassei', 'yasuragi'] },
]

export const STEP2: Step2[] = [
  { id: 'hito', label: '人とのこと', emotions: ['ningenkankei', 'kodoku', 'urami', 'shounin'] },
  { id: 'shigoto', label: 'しごと・お金のこと', emotions: ['okane', 'mukuwarenai', 'isogashii', 'aseri'] },
  { id: 'kazoku', label: '家族のこと', emotions: ['kazoku', 'wakare', 'zaiakukan'] },
  { id: 'inochi', label: '病い・老い・死のこと', emotions: ['shi', 'fuan', 'wakare'] },
  { id: 'jibun', label: '自分のこと', emotions: ['jikokeno', 'koukai', 'mayoi', 'munashisa'] },
  { id: 'nanto', label: 'これといって、ない', emotions: ['yasuragi', 'munashisa', 'henka'] },
]

export const STEP3: Step3[] = [
  { id: 'kotoba', label: '気持ちを言い当ててほしい', note: '古い言葉のほうから、今の気持ちに名前をつけます' },
  { id: 'wake', label: 'なぜこうなるのか知りたい', note: '仕組みの話として、順を追って見ます' },
  { id: 'shizuka', label: '少し静かになりたい', note: '説明より、短い一行と、ひとつの話だけ' },
  { id: 'warai', label: 'ちょっと笑いたい', note: '毎日使っている言葉の、意外な出どころから' },
]
