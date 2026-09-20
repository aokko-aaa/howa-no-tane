declare module '*/scripts/rss.mjs' {
  export type RawHeadline = { title: string; link: string; source: string; date: string }
  export function parseRss(xml: string, limit?: number): RawHeadline[]
  export function splitTitle(raw: string): { title: string; source: string }
}
