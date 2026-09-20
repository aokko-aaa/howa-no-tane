import { EMOTIONS } from '../data/emotions'
import type { EmotionId } from '../data/types'

/** 自由記述から感情タグを推定する（選択済みの補助） */
export function detectEmotions(text: string): EmotionId[] {
  if (!text.trim()) return []
  const hits: { id: EmotionId; n: number }[] = []
  for (const e of EMOTIONS) {
    let n = 0
    for (const k of e.keywords) if (text.includes(k)) n++
    if (n > 0) hits.push({ id: e.id, n })
  }
  return hits
    .sort((a, b) => b.n - a.n)
    .slice(0, 4)
    .map((h) => h.id)
}

export type Ranked<T> = {
  item: T
  score: number
  /** 選ばれた気持ちにいくつ当たっているか。並べ替えの前に、これで足切りする */
  match: number
  /** 書かれた文に、この素材の語がいくつ出てきたか */
  hits: number
}

/**
 * 感情タグの一致を主、自由記述の語の一致を従として並べ替える。
 * スコアが0でも候補からは外さない（切り口の数を確保するため）。
 */
export function rankItems<T>(
  items: readonly T[],
  selected: readonly EmotionId[],
  text: string,
  getEmotions: (t: T) => readonly EmotionId[],
  getWords: (t: T) => readonly string[],
): Ranked<T>[] {
  const sel = new Set(selected)
  const body = text.trim()
  return items
    .map((item) => {
      // 気持ちの一致を大きく取る。ここを小さくすると、宗派の加点に負けて
      // 「イライラする」で死に際の話が出る、といったズレが起きる。
      let match = 0
      for (const t of getEmotions(item)) if (sel.has(t)) match++
      let hits = 0
      if (body) {
        // 書かれた文に素材の語が出ていたら、気持ちより強い手がかりとして扱う
        for (const w of getWords(item)) {
          if (w.length >= 2 && body.includes(w)) hits++
        }
      }
      return { item, score: match * 10 + hits * 14, match: match + hits, hits }
    })
    .sort((a, b) => b.score - a.score)
}
