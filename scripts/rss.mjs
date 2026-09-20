// RSS / Atom から見出しを取り出す。ブラウザでもNodeでも動くよう、依存なしで書く。

const unwrap = (t) =>
  t
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim()

const tagOf = (block, tag) => {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
  if (m) return unwrap(m[1])
  const href = block.match(new RegExp(`<${tag}[^>]*href=["']([^"']+)["'][^>]*/?>`, 'i'))
  return href ? href[1] : ''
}

/** Google ニュースの見出しは「本文 - 媒体名」の形で来る */
export function splitTitle(raw) {
  const i = raw.lastIndexOf(' - ')
  if (i > 0 && raw.length - i < 30) {
    return { title: raw.slice(0, i).trim(), source: raw.slice(i + 3).trim() }
  }
  return { title: raw.trim(), source: '' }
}

export function parseRss(xml, limit = 20) {
  const blocks = xml.match(/<(item|entry)[\s\S]*?<\/(item|entry)>/gi) ?? []
  return blocks
    .slice(0, limit)
    .map((block) => {
      const { title, source } = splitTitle(tagOf(block, 'title'))
      return {
        title,
        link: tagOf(block, 'link'),
        source: source || tagOf(block, 'source'),
        date: tagOf(block, 'pubDate') || tagOf(block, 'updated') || '',
      }
    })
    .filter((h) => h.title.length > 0)
}
