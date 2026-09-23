import { useMemo, useState } from 'react'
import { copyText } from '../lib/format'
import {
  bridges,
  CLOSENESS_LABEL,
  CLOSENESS_NOTE,
  emotionLabel,
  findSituations,
  situationNeta,
  sourcesOf,
  SOURCE_KINDS,
  SOURCE_LABEL,
  SOURCE_SHORT,
  takeCount,
  takeNeta,
  takeOpenings,
  takesOf,
  takeSheet,
  toWorksheet,
  type Closeness,
  type Situation,
  type Source,
  type SourceKind,
} from '../lib/situations'
import type { Take } from '../data/types'
import { savedStore } from '../lib/storage'

/**
 * 話したいことから、いまの情景を引っ張り出す。
 * ここでは文章を組み立てない。両側を並べて、つなぐのは語り手。
 *
 * 画面の作り：
 * - 一覧は一行ずつ。場面の名と「そこで思っていること」だけ見せて、あとは畳む。
 *   （十二件すべてを開いて並べると、どれも同じ重さになって選べない）
 * - 近さで束に分け、見出しで示す。並び順だけでは目で見て分からない。
 * - 気持ちの札は一覧に出さない。「穏やか・満たされている」が病室の窓に付くと、
 *   合っている合っていないの判断を邪魔するだけになる。開いたときに小さく出す。
 * - ボタンは開いた一件にだけ出す。
 */

const ORDER: Closeness[] = ['near', 'some', 'far']

export default function SituationView({ onSaved }: { onSaved?: (ids: string[]) => void }) {
  const [kind, setKind] = useState<SourceKind>('concept')
  const [q, setQ] = useState('')
  const [onlyTakes, setOnlyTakes] = useState(false)
  const [picked, setPicked] = useState<Source | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  // 近いところは全部出す。それ以外は、はじめ数件だけにして畳んでおく。
  // 一度に十数件並べると、どれも同じ重さになって選べない。
  const [expanded, setExpanded] = useState<Closeness[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<string[]>(() =>
    savedStore.list().map((x) => x.neta.id),
  )

  const list = useMemo(() => {
    const term = q.trim()
    // 打っているあいだは棚をまたいで探す。
    // 「釈迦」は仏教語の棚に無く人物の棚にあるので、棚ごとに探すと〇件になる。
    // 探している側からすれば、どの棚にあるかは打つ前には分からない。
    const hit =
      term === ''
        ? sourcesOf(kind)
        : SOURCE_KINDS.flatMap((k) => sourcesOf(k)).filter((s) => s.search.includes(term))
    // 案のあるものを先に。まだ書けていない言葉のほうが多いので
    const withCount = hit.map((s) => ({ s, n: takeCount(s.kind, s.id) }))
    // いま選んでいる棚のものを先に出す。選んだことは無駄にしない
    const sorted = [...withCount].sort(
      (a, b) => Number(b.s.kind === kind) - Number(a.s.kind === kind) || b.n - a.n,
    )
    return onlyTakes ? sorted.filter((x) => x.n > 0) : sorted
  }, [kind, q, onlyTakes])

  const takes = useMemo(() => (picked ? takesOf(picked) : []), [picked])

  const groups = useMemo(() => {
    const found = picked ? findSituations(picked) : []
    return ORDER.map((c) => ({ closeness: c, items: found.filter((x) => x.closeness === c) }))
      .filter((g) => g.items.length > 0)
  }, [picked])

  const copy = async (text: string, what: string) => {
    const ok = await copyText(text)
    setMsg(ok ? `${what}をコピーしました` : 'コピーできませんでした')
    setTimeout(() => setMsg(null), 2200)
  }

  const addToBook = (neta: ReturnType<typeof situationNeta>, emotions: string[]) => {
    const next = savedStore.add({
      neta,
      memo: '',
      savedAt: new Date().toISOString(),
      fromEmotions: emotions,
      fromText: '',
    })
    const ids = next.map((x) => x.neta.id)
    setSavedIds(ids)
    onSaved?.(ids)
    setMsg('ネタ帳に入れました。メモを足して〈AIに渡す〉へ')
    setTimeout(() => setMsg(null), 2600)
  }

  const save = (sit: Situation) => {
    if (!picked) return
    const next = savedStore.add({
      neta: situationNeta(picked, sit),
      memo: '',
      savedAt: new Date().toISOString(),
      fromEmotions: sit.sharedEmotions,
      fromText: '',
    })
    const ids = next.map((x) => x.neta.id)
    setSavedIds(ids)
    onSaved?.(ids)
    setMsg('ネタ帳に入れました。メモを足して〈AIに渡す〉へ')
    setTimeout(() => setMsg(null), 2600)
  }

  const choose = (s: Source) => {
    setPicked(s)
    setOpenId(null)
    setExpanded([])
  }

  const switchKind = (k: SourceKind) => {
    setKind(k)
    setPicked(null)
    setQ('')
  }

  /** 一件ぶん。畳んだ状態は、場面の名と思いの一行だけ */
  const row = (sit: Situation) => {
    const m = sit.modern
    const open = openId === m.id
    const saved = picked ? savedIds.includes(situationNeta(picked, sit).id) : false
    return (
      <div key={m.id} className={`card overflow-hidden ${open ? 'border-enji/40' : ''}`}>
        <button
          type="button"
          className="w-full px-4 py-3 text-left transition-colors hover:bg-stone-50"
          onClick={() => setOpenId(open ? null : m.id)}
        >
          <div className="flex items-baseline gap-2">
            <h3 className="text-[15px] font-bold leading-snug">{m.scene}</h3>
            <span className="ml-auto shrink-0 text-xs text-stone-400">{open ? '閉じる' : 'ひらく'}</span>
          </div>
          <p className="mt-0.5 text-sm leading-relaxed text-stone-600">{m.omoi}</p>
        </button>

        {open && (
          <div className="border-t border-stone-100 px-4 py-3">
            <div className="label">語り出しに使える一文</div>
            <p className="mt-1 text-[15px] leading-relaxed">{m.line}</p>

            {/*
              なぜ結びつくのか。ラベルの名前だけでは分からないので、
              話題ごとに、場面の側と言葉の側を並べる。
              最後のひと渡しは書かない。そこは語り手の仕事。
            */}
            <div className="mt-3 rounded-lg bg-stone-50 px-3 py-2.5">
              <div className="label mb-1.5">どこで重なるか</div>
              <div className="flex flex-col gap-2">
                {bridges(sit).map((b) => (
                  <div key={b.topic}>
                    <div className="text-xs font-bold text-enji">〈{b.label}〉</div>
                    <dl className="mt-0.5 space-y-0.5 text-sm leading-relaxed">
                      <div className="flex gap-2">
                        <dt className="w-[5.5rem] shrink-0 text-xs text-stone-500">この場面では</dt>
                        <dd>{b.scene}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-[5.5rem] shrink-0 text-xs text-stone-500">この言葉は</dt>
                        <dd>{b.teaching}</dd>
                      </div>
                    </dl>
                  </div>
                ))}
                {bridges(sit).length === 0 && (
                  <p className="text-sm leading-relaxed text-stone-600">
                    話題は違います。重なっているのは気持ちのほうだけです。
                  </p>
                )}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-stone-500">
                このあいだをどう渡すかは、機械には書けません。ご自身の言葉で。
                {sit.sharedEmotions.length > 0 && (
                  <>
                    <br />
                    気持ちの重なり：{sit.sharedEmotions.map(emotionLabel).join('・')}
                  </>
                )}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn-ghost" onClick={() => copy(m.line, '語り出し')}>
                語り出しをコピー
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => picked && copy(toWorksheet(picked, sit), '下ごしらえの用紙')}
              >
                下ごしらえの用紙
              </button>
              {saved ? (
                <span className="btn-ghost text-stone-400">ネタ帳に入れた</span>
              ) : (
                <button type="button" className="btn-primary" onClick={() => save(sit)}>
                  ネタ帳に入れる
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!picked) {
    return (
      <div className="flex flex-col gap-3">
{/*
          三つの棚は、折り返すと「いまどれか」が分からなくなる。
          一体の切り替えにして、選んでいるものだけを白く浮かせる。
        */}
        <div className="flex gap-1 rounded-2xl bg-[#ede7d6] p-1">
          {SOURCE_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              className={`min-h-tap flex-1 rounded-xl px-2 text-sm transition-colors ${
                kind === k
                  ? 'bg-white font-bold text-sumi shadow-sm'
                  : 'font-bold text-stone-600 hover:bg-white/50'
              }`}
              onClick={() => switchKind(k)}
            >
              <span className="sm:hidden">{SOURCE_SHORT[k]}</span>
              <span className="hidden sm:inline">{SOURCE_LABEL[k]}</span>
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={
            kind === 'concept'
              ? '言葉や問いで探す（例：報われない、がんばれば、無常）'
              : kind === 'phrase'
                ? '一節や出典で探す（例：歎異抄、御文章、恩徳讃）'
                : '人物や品物で探す（例：釈迦、たくあん、お茶、掃除）'
          }
          className="min-h-tap w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
        <div className="flex flex-wrap items-center gap-2">
          {/* 打つ前の「28件」は棚の総数でしかなく、読む意味がない */}
          {q.trim() !== '' && (
            <span className="text-xs text-stone-500">
              {list.length}件{list.length > 0 && '（三つの棚から）'}
            </span>
          )}
          <label className="ml-auto flex cursor-pointer items-center gap-1.5 text-xs text-stone-600">
            <input
              type="checkbox"
              checked={onlyTakes}
              onChange={(e) => setOnlyTakes(e.target.checked)}
              className="h-4 w-4 accent-enji"
            />
            話の案があるものだけ
          </label>
        </div>
        {q.trim() !== '' && list.length === 0 && (
          <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs leading-relaxed text-stone-600">
            三つの棚のどこにもありませんでした。別の言い方でも探しています（釈迦・お釈迦さま・戒名・天国など）。
            それでも出ないときは、まだ材料がありません。
          </div>
        )}
        <div className="flex flex-col gap-2">
          {list.map(({ s, n }) => (
            <button
              key={`${s.kind}:${s.id}`}
              type="button"
              className="card px-4 py-3 text-left transition-colors hover:bg-stone-50"
              onClick={() => choose(s)}
            >
              <div className="flex flex-wrap items-baseline gap-2">
                {s.kind !== kind && (
                  <span className="shrink-0 rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-600">
                    {SOURCE_LABEL[s.kind]}
                  </span>
                )}
                <h3 className="text-base font-bold leading-snug">{s.title}</h3>
                <span className="text-xs text-stone-500">{s.sub}</span>
                {n > 0 && (
                  <span className="ml-auto shrink-0 rounded bg-enji/10 px-1.5 py-0.5 text-xs font-bold text-enji">
                    話の案 {n}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-stone-700">{s.body}</p>
              <p className="mt-1 text-xs leading-relaxed text-enji">{s.hint}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 話したいことは、上に小さく留めておく。何の話を探しているのか見失わないように */}
      <section className="sticky top-0 z-10 -mx-4 border-b border-stone-200 bg-white/95 px-4 py-2.5 backdrop-blur">
        <div className="flex items-baseline gap-2">
          <h2 className="text-base font-bold leading-snug">{picked.title}</h2>
          <button
            type="button"
            className="ml-auto shrink-0 text-xs text-stone-500 underline"
            onClick={() => setPicked(null)}
          >
            選び直す
          </button>
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-stone-600">{picked.hint}</p>
      </section>

      {msg && <p className="text-xs text-matcha">{msg}</p>}

      {takes.length > 0 && (
        <section className="flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h3 className="text-sm font-bold text-enji">この言葉でできる話</h3>
            <span className="text-xs text-stone-500">{takes.length}案</span>
          </div>
          {takes.map((take: Take) => (
            <article key={take.id} className="card px-4 py-3">
              <h4 className="text-[15px] font-bold leading-snug">{take.title}</h4>
              <p className="mt-1.5 text-[15px] leading-relaxed">{take.core}</p>

              <div className="mt-2.5 rounded-lg bg-stone-50 px-3 py-2">
                <div className="label">入口</div>
                <ul className="mt-1 flex flex-col gap-1 text-sm leading-relaxed">
                  {takeOpenings(take).map((o) => (
                    <li key={o.label}>
                      ・{o.label}
                      {o.line && <span className="block pl-3 text-stone-500">{o.line}</span>}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-2 text-sm leading-relaxed">
                <span className="label">一歩 </span>
                {take.step}
              </p>
              {take.source && <p className="mt-1.5 text-xs text-stone-500">典拠：{take.source}</p>}
              {take.caution && (
                <p className="mt-1 text-xs text-amber-700">語る前に確認：{take.caution}</p>
              )}

              <div className="mt-2.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => picked && copy(takeSheet(picked, take), 'この案')}
                >
                  この案をコピー
                </button>
                {picked && savedIds.includes(takeNeta(picked, take).id) ? (
                  <span className="btn-ghost text-stone-400">ネタ帳に入れた</span>
                ) : (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => picked && addToBook(takeNeta(picked, take), [])}
                  >
                    ネタ帳に入れる
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      {takes.length === 0 && (
        <p className="rounded-lg bg-stone-50 px-3 py-2.5 text-sm leading-relaxed text-stone-600">
          この言葉の<span className="font-bold">話の案</span>は、まだ書けていません。
          下の情景から、ご自身で組み立ててください。
        </p>
      )}

      {/*
        案のある言葉では、情景の一覧を出さない。
        気持ちが重なるというだけで並ぶので、案の下に置くと
        「これも使える入口」に見えて、かえって分からなくなる。
        案の中に、その案のための入口が入っている。
        案のまだ無い言葉では、ここが唯一の手がかりなので残す。
      */}
      {takes.length === 0 && (
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 border-t border-stone-200 pt-3">
        <h3 className="text-sm font-bold text-stone-600">近いところにある情景</h3>
        <span className="text-xs text-stone-500">気持ちや話題が重なるもの。近い順に</span>
      </div>
      )}

      {takes.length === 0 && groups.map((g) => {
        const open = g.closeness === 'near' || expanded.includes(g.closeness)
        const shown = open ? g.items : g.items.slice(0, g.closeness === 'some' ? 3 : 0)
        const rest = g.items.length - shown.length
        return (
          <section key={g.closeness} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <h3 className="text-sm font-bold text-enji">{CLOSENESS_LABEL[g.closeness]}</h3>
              <span className="text-xs text-stone-500">{g.items.length}件</span>
              <span className="text-xs text-stone-400">{CLOSENESS_NOTE[g.closeness]}</span>
            </div>
            {shown.map(row)}
            {rest > 0 && (
              <button
                type="button"
                className="btn-ghost self-start"
                onClick={() => setExpanded((p) => [...p, g.closeness])}
              >
                あと{rest}件をひらく
              </button>
            )}
            {open && g.closeness !== 'near' && g.items.length > 3 && (
              <button
                type="button"
                className="self-start text-xs text-stone-500 underline"
                onClick={() => setExpanded((p) => p.filter((x) => x !== g.closeness))}
              >
                畳む
              </button>
            )}
          </section>
        )
      })}

      {takes.length === 0 && groups.length === 0 && (
        <p className="text-sm leading-relaxed text-stone-500">
          近い情景が見つかりませんでした。別の言葉で試してみてください。
        </p>
      )}
    </div>
  )
}
