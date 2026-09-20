import { WORDS } from '../data/words'
import type { Word } from '../data/types'
import { hashString } from './random'

/**
 * 日替わりの一つ。
 * 「毎日使っているこの言葉、じつは仏教語だった」が、いちばん近いところにある入口なので、
 * アプリを開いたときにまずそれを一つ見せる。日付から決めるので、同じ日は同じ言葉になる。
 */
export function wordOfTheDay(date: Date = new Date()): Word {
  const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  return WORDS[hashString(key) % WORDS.length]
}
