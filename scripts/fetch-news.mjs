// ビルドのたびに公開RSSを読み、public/news.json に書き出す。
//
// ブラウザから直接ニュースサイトを読むことは CORS でできず、
// 公開の中継サービスは止まることがあって当てにならなかった。
// ここ（GitHub Actions のサーバー）なら制約がないので、取得はビルド時に済ませ、
// アプリは自分と同じ場所に置かれた news.json を読むだけにする。
//
// 取得に失敗しても、空の news.json を書いてビルドは続ける（貼り付け欄は使えるため）。

import { writeFile, mkdir } from 'node:fs/promises'
import { parseRss } from './rss.mjs'

const FEEDS = [
  { id: 'nhk', label: 'NHK 主要', url: 'https://www.nhk.or.jp/rss/news/cat0.xml' },
  { id: 'g-top', label: '総合', url: 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja' },
  {
    id: 'g-life',
    label: '暮らし',
    url: 'https://news.google.com/rss/search?q=%E6%9A%AE%E3%82%89%E3%81%97&hl=ja&gl=JP&ceid=JP:ja',
  },
  {
    id: 'g-econ',
    label: '経済',
    url: 'https://news.google.com/rss/search?q=%E7%B5%8C%E6%B8%88&hl=ja&gl=JP&ceid=JP:ja',
  },
  {
    id: 'g-society',
    label: '社会',
    url: 'https://news.google.com/rss/search?q=%E7%A4%BE%E4%BC%9A&hl=ja&gl=JP&ceid=JP:ja',
  },
]

const PER_FEED = 15
const TIMEOUT_MS = 15000

async function fetchFeed(feed) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(feed.url, {
      signal: ctrl.signal,
      headers: { 'user-agent': 'howa-no-tane/1.0 (+https://github.com/aokko-aaa/howa-no-tane)' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const items = parseRss(await res.text(), PER_FEED)
    console.log(`${feed.id}: ${items.length}件`)
    return { id: feed.id, label: feed.label, items }
  } catch (e) {
    console.warn(`${feed.id}: 取得できませんでした（${e instanceof Error ? e.message : e}）`)
    return { id: feed.id, label: feed.label, items: [] }
  } finally {
    clearTimeout(timer)
  }
}

const feeds = await Promise.all(FEEDS.map(fetchFeed))
const total = feeds.reduce((n, f) => n + f.items.length, 0)

await mkdir('public', { recursive: true })
await writeFile(
  'public/news.json',
  JSON.stringify({ generatedAt: new Date().toISOString(), feeds }, null, 1),
  'utf8',
)
console.log(`public/news.json を書き出しました（合計 ${total}件）`)
