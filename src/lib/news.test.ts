import { describe, expect, it } from 'vitest'
import { NEWS_CAUTION } from '../data/news'
import { generateNeta, SECTION, type GenerateInput } from './generate'
import { parseRss } from '../../scripts/rss.mjs'
import { applyNewsLead, classifyHeadline, emotionsFromHeadline, filterHeadlines } from './news'

const RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>ニュース</title>
  <item>
    <title><![CDATA[電気代など相次ぐ値上げ　家計への影響は - ○○新聞]]></title>
    <link>https://example.com/a</link>
    <pubDate>Sat, 20 Sep 2026 01:00:00 GMT</pubDate>
    <source url="https://example.com">○○新聞</source>
  </item>
  <item>
    <title>大雨で避難指示　各地で被害</title>
    <link>https://example.com/b</link>
    <pubDate>Sat, 20 Sep 2026 00:30:00 GMT</pubDate>
  </item>
</channel></rss>`

const ATOM = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title>優勝を決めた一戦</title>
    <link href="https://example.com/c"/>
    <updated>2026-09-20T01:00:00Z</updated>
  </entry>
</feed>`

describe('RSSの読み取り', () => {
  it('見出し・リンク・媒体名を取り出す', () => {
    const items = parseRss(RSS)
    expect(items).toHaveLength(2)
    expect(items[0].title).toBe('電気代など相次ぐ値上げ　家計への影響は')
    expect(items[0].source).toBe('○○新聞')
    expect(items[0].link).toBe('https://example.com/a')
    expect(items[1].title).toBe('大雨で避難指示　各地で被害')
  })

  it('Atom形式でも読める', () => {
    const items = parseRss(ATOM)
    expect(items[0].title).toBe('優勝を決めた一戦')
    expect(items[0].link).toBe('https://example.com/c')
  })

  it('壊れた中身でも落ちない', () => {
    expect(parseRss('<html>not rss</html>')).toEqual([])
    expect(parseRss('')).toEqual([])
  })

  it('件数を絞れる', () => {
    expect(parseRss(RSS, 1)).toHaveLength(1)
  })

  it('取り込んだ見出しを言葉で絞れる', () => {
    const items = parseRss(RSS)
    expect(filterHeadlines(items, '値上げ')).toHaveLength(1)
    expect(filterHeadlines(items, '○○新聞')).toHaveLength(1)
    expect(filterHeadlines(items, '')).toHaveLength(2)
    expect(filterHeadlines(items, 'そんな語はない')).toHaveLength(0)
  })
})

describe('見出しを話題の型に当てる', () => {
  it('値上げの見出しから、お金の話題を拾う', () => {
    const topics = classifyHeadline('電気代など相次ぐ値上げ　家計への影響は')
    expect(topics[0].id).toBe('neage')
    expect(emotionsFromHeadline('電気代など相次ぐ値上げ', topics)).toContain('okane')
  })

  it('災害の見出しでは、扱いの注意がついている型になる', () => {
    const topics = classifyHeadline('大雨で避難指示　各地で被害')
    expect(topics[0].id).toBe('saigai')
    expect(topics[0].caution).toBeTruthy()
  })

  it('当てはまらない見出しでも空で返るだけ', () => {
    expect(classifyHeadline('あいうえお')).toEqual([])
    expect(emotionsFromHeadline('あいうえお', [])).toEqual([])
  })

  it('型に当たらなくても、語から気持ちを拾える', () => {
    expect(emotionsFromHeadline('さびしい夜に読む本', [])).toContain('kodoku')
  })
})

describe('ニュースから法話の案にする', () => {
  const base: GenerateInput = {
    text: '電気代など相次ぐ値上げ',
    emotions: ['okane', 'fuan'],
    sceneId: 'howakai',
    month: 9,
    kojitsukeMax: 2,
    tradition: 'otani',
    seed: 5,
    count: 3,
  }

  it('入口が今日の話題に差し替わる', () => {
    const topic = classifyHeadline('電気代など相次ぐ値上げ')[0]
    const out = applyNewsLead(generateNeta(base), '電気代など相次ぐ値上げ', topic)
    for (const n of out) {
      // お聖教の一句から入る切り口では、見出しは二番目に来る
      const lead = n.sections.find((x) => x.label === '入口（今日の話題）')
      expect(lead, n.title).toBeDefined()
      expect(lead!.body).toContain('電気代など相次ぐ値上げ')
      expect(n.title).toContain(topic.label)
    }
  })

  it('実際の出来事を扱う心得が、必ず注意に入る', () => {
    const topic = classifyHeadline('大雨で避難指示')[0]
    const out = applyNewsLead(generateNeta(base), '大雨で避難指示', topic)
    for (const n of out) {
      expect(n.cautions[0]).toBe(NEWS_CAUTION)
      expect(n.cautions.join('\n')).toContain('被災された方')
    }
  })

  it('話題の見どころが、語り手向けメモに入る', () => {
    const topic = classifyHeadline('電気代など相次ぐ値上げ')[0]
    const out = applyNewsLead(generateNeta(base), '電気代など相次ぐ値上げ', topic)
    const memo = out[0].sections.find((x) => x.label === SECTION.memo)!
    expect(memo.body).toContain('この話題の見どころ')
  })

  it('型に当たらない見出しでも、注意だけはついて案が出る', () => {
    const out = applyNewsLead(generateNeta(base), '何かのニュース', undefined)
    expect(out).toHaveLength(3)
    expect(out[0].cautions[0]).toBe(NEWS_CAUTION)
  })
})
