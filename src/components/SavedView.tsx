import { useEffect, useMemo, useRef, useState } from 'react'
import type { Neta } from '../data/types'
import { combineNetas } from '../lib/combine'
import { groundOf, groundSheet } from '../lib/ground'
import {
  BRIEF_FORMS,
  DEFAULT_BRIEF,
  toAIBrief,
  type BriefForm,
  type BriefOptions,
} from '../lib/brief'
import { copyText, toMarkdown } from '../lib/format'
import {
  ratingStore,
  snapshotOf,
  toRatingsMarkdown,
  type Rating,
  type Verdict,
  type Where,
} from '../lib/ratings'
import { savedStore, type SavedNeta } from '../lib/storage'
import NetaCard from './NetaCard'

type Props = {
  /** ネタ帳の中身が変わったことを、タブの件数へ返す */
  onChange?: (ids: string[]) => void
  ratings: Rating[]
  onRatingsChange: (list: Rating[]) => void
}

export default function SavedView({ onChange, ratings, onRatingsChange }: Props) {
  const [list, setList] = useState<SavedNeta[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [picked, setPicked] = useState<string[]>([])
  const [combined, setCombined] = useState<Neta | null>(null)
  const [cannot, setCannot] = useState<string | null>(null)
  const combinedRef = useRef<HTMLElement>(null)
  const [brief, setBrief] = useState<BriefOptions>(DEFAULT_BRIEF)

  useEffect(() => {
    setList(savedStore.list())
  }, [])

  const savedIds = useMemo(() => list.map((x) => x.neta.id), [list])

  useEffect(() => {
    onChange?.(savedIds)
    // 件数を返すだけ。onChange の同一性は当てにしない。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedIds.join(',')])

  const exportAll = async () => {
    const ok = await copyText(toMarkdown(list.map((x) => ({ neta: x.neta, memo: x.memo }))))
    setMsg(ok ? 'ネタ帳をまるごとコピーしました' : 'コピーできませんでした')
    setTimeout(() => setMsg(null), 2200)
  }

  const ratingOf = (id: string) => ratings.find((x) => x.netaId === id)

  const rate = (neta: Neta, verdict: Verdict | null, where: Where[], memo: string) => {
    if (verdict === null) {
      onRatingsChange(ratingStore.remove(neta.id))
      return
    }
    const prev = ratingOf(neta.id)
    onRatingsChange(
      ratingStore.set({
        netaId: neta.id,
        verdict,
        where: verdict === 'off' ? where : [],
        memo,
        at: new Date().toISOString(),
        snapshot: snapshotOf(neta),
        // ネタ帳からの評価は、保存したときの条件を使う
        context: prev?.context ?? {
          text: list.find((x) => x.neta.id === neta.id)?.fromText ?? '',
          emotions: list.find((x) => x.neta.id === neta.id)?.fromEmotions ?? [],
          reasons: [],
          sceneId: '',
          tradition: neta.tradition,
          scale: '',
        },
      }),
    )
  }

  const exportRatings = async () => {
    const ok = await copyText(toRatingsMarkdown(ratings))
    setMsg(ok ? `評価${ratings.length}件をコピーしました` : 'コピーできませんでした')
    setTimeout(() => setMsg(null), 2600)
  }

  /** 素材と守ってほしいことを一枚にして、AIに渡す */
  const copyBrief = async (items: SavedNeta[], what: string) => {
    const ok = await copyText(toAIBrief(items, brief))
    setMsg(ok ? `${what}をコピーしました。AIに貼ってください` : 'コピーできませんでした')
    setTimeout(() => setMsg(null), 3000)
  }

  const togglePick = (id: string) =>
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const remove = (id: string) => {
    setList(savedStore.remove(id))
    setPicked((prev) => prev.filter((x) => x !== id))
    // 消した案でできていた組み上がりは、もう元がない
    setCombined((prev) => (prev && picked.includes(id) ? null : prev))
  }

  /** ネタ帳に溜めたものを、日をまたいで組み直す */
  const combine = () => {
    // 並びはネタ帳の並びのまま（新しいものが上）
    const chosen = list.filter((x) => picked.includes(x.neta.id)).map((x) => x.neta)
    const next = combineNetas(chosen)
    setCombined(next)
    // 組めないまま黙っていると、壊れているようにしか見えない
    setCannot(
      next
        ? null
        : '選んだものに仏教語が入っていないので、一本には組み直せません。かわりに、下の〈重なっているところ〉をご覧ください。',
    )
    if (!next) return
    requestAnimationFrame(() => {
      combinedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  /** 組み直したものも、そのままネタ帳に入れて、次はそれをまた組める */
  const saveCombined = (neta: Neta) => {
    const from = list.filter((x) => picked.includes(x.neta.id))
    setList(
      savedStore.add({
        neta,
        memo: '',
        savedAt: new Date().toISOString(),
        fromEmotions: Array.from(new Set(from.flatMap((x) => x.fromEmotions))),
        fromText: from.map((x) => x.fromText).find((x) => x) ?? '',
      }),
    )
  }

  /** えらんだものの、重なっているところ。組み直せない組み合わせでも出る */
  const ground = useMemo(() => {
    const chosen = list.filter((x) => picked.includes(x.neta.id)).map((x) => x.neta)
    return groundOf(chosen)
  }, [list, picked])

  const briefPanel = (
    <section className="card px-4 py-3">
      <h2 className="text-sm font-bold">AIに渡して、法話に成形してもらう</h2>
      <p className="mt-1 text-xs leading-relaxed text-stone-500">
        素材と、守ってほしいことを一枚にまとめて書き出します。ChatGPTやClaudeに貼れば下書きが返ります。
        このアプリは文章を組み立てません。書くのは向こう側、素材と縛りを渡すのがここの役目です。
      </p>

      <div className="mt-2.5 flex flex-col gap-2.5">
        <div>
          <div className="label mb-1.5">組み立て</div>
          <div className="flex flex-wrap gap-1.5">
            {BRIEF_FORMS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`chip ${brief.form === f.id ? 'chip-on' : ''}`}
                onClick={() => setBrief((p) => ({ ...p, form: f.id as BriefForm }))}
                title={f.note}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <div className="label mb-1.5">長さ</div>
            <div className="flex flex-wrap gap-1.5">
              {[0, 3, 5, 10].map((mi) => (
                <button
                  key={mi}
                  type="button"
                  className={`chip ${brief.minutes === mi ? 'chip-on' : ''}`}
                  onClick={() => setBrief((p) => ({ ...p, minutes: mi }))}
                >
                  {mi === 0 ? '掲示板・SNS' : `${mi}分`}
                </button>
              ))}
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              checked={brief.otani}
              onChange={(e) => setBrief((p) => ({ ...p, otani: e.target.checked }))}
              className="h-4 w-4 accent-enji"
            />
            真宗大谷派の作法に合わせる
          </label>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary"
          disabled={picked.length === 0}
          onClick={() =>
            copyBrief(
              list.filter((x) => picked.includes(x.neta.id)),
              `えらんだ${picked.length}件の指示書`,
            )
          }
        >
          {picked.length === 0
            ? '〈組む〉で選ぶと、まとめて渡せます'
            : `えらんだ${picked.length}件をAIに渡す`}
        </button>
        <button type="button" className="btn-ghost" onClick={() => copyBrief(list, 'ネタ帳全部の指示書')}>
          ネタ帳ぜんぶ（{list.length}件）
        </button>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-amber-700">
        出典は書き出した範囲だけを使うよう指示していますが、
        <span className="font-bold">AIはそれでも作り話を混ぜます。</span>
        返ってきた引用は、語る前に必ず原典でお確かめください。
      </p>
    </section>
  )

  const ratingPanel = (
    <section className="card px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-bold">評価の記録</h2>
        <span className="text-sm text-stone-600">
          {ratings.length}件（◎ {ratings.filter((x) => x.verdict === 'good').length} ／ △{' '}
          {ratings.filter((x) => x.verdict === 'off').length}）
        </span>
        <button
          type="button"
          className="btn-ghost ml-auto"
          disabled={ratings.length === 0}
          onClick={exportRatings}
        >
          評価を書き出す（Markdown）
        </button>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
        評価はアプリの出し方を変えません。端末に溜めておいて、書き出して、
        直すときの材料にするためのものです。〈書き出す〉でコピーして、そのまま渡せます。
      </p>
      {ratings.length > 0 && (
        <button
          type="button"
          className="mt-2 text-xs text-stone-400 underline"
          onClick={() => {
            if (confirm(`評価${ratings.length}件を消します。よろしいですか。`)) {
              onRatingsChange(ratingStore.clear())
            }
          }}
        >
          評価を全部消す
        </button>
      )}
    </section>
  )

  if (list.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        {ratingPanel}
        {msg && <p className="text-xs text-matcha">{msg}</p>}
        <p className="text-sm leading-relaxed text-stone-500">
          ネタ帳にはまだ何も入っていません。「つくる」で出たネタを〈ネタ帳に入れる〉と、ここに溜まります。
          <br />
          保存先はこの端末のブラウザです（サーバーには送っていません）。
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {briefPanel}
      {ratingPanel}
      <div className="flex items-center gap-2">
        <span className="text-sm text-stone-600">{list.length}件</span>
        <button type="button" className="btn-ghost ml-auto" onClick={exportAll}>
          まるごとコピー（Markdown）
        </button>
      </div>
      {msg && <p className="text-xs text-matcha">{msg}</p>}

      {list.length > 1 && (
        <p className="text-xs leading-relaxed text-stone-500">
          〈組む〉を入れて二つ以上えらぶと、日をまたいで溜めたものを一本に組み直せます。
          組んだものをネタ帳に入れれば、それをまた次の材料にできます。
        </p>
      )}

      {ground && (
        <section className="card flex flex-col gap-2.5 px-4 py-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className="text-sm font-bold text-enji">重なっているところ</h2>
            <span className="text-xs text-stone-500">えらんだ{ground.items.length}件から</span>
            <button
              type="button"
              className="ml-auto text-xs text-stone-500 underline"
              onClick={async () => {
                const ok = await copyText(groundSheet(ground))
                setMsg(ok ? '重なっているところをコピーしました' : 'コピーできませんでした')
                setTimeout(() => setMsg(null), 2200)
              }}
            >
              用紙をコピー
            </button>
          </div>

          {ground.shared.length === 0 && ground.partial.length === 0 && (
            <p className="text-sm leading-relaxed text-stone-600">
              話題は重なっていません。別々の話として持っておくほうがよさそうです。
            </p>
          )}

          {[...ground.shared, ...ground.partial].map((tp) => (
            <div key={tp.id} className="rounded-lg bg-stone-50 px-3 py-2.5">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-xs font-bold text-enji">〈{tp.label}〉</span>
                <span className="text-xs text-stone-500">
                  {tp.from.length === ground.items.length
                    ? 'ぜんぶに'
                    : `${tp.from.length}件に`}
                </span>
              </div>
              <dl className="mt-1 space-y-0.5 text-sm leading-relaxed">
                <div className="flex gap-2">
                  <dt className="w-[5.5rem] shrink-0 text-xs text-stone-500">この場面では</dt>
                  <dd>{tp.scene}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-[5.5rem] shrink-0 text-xs text-stone-500">この教えは</dt>
                  <dd>{tp.teaching}</dd>
                </div>
              </dl>
              <p className="mt-1 text-xs leading-relaxed text-stone-500">{tp.from.join('／')}</p>
            </div>
          ))}

          {ground.emotions.length > 0 && (
            <p className="text-xs leading-relaxed text-stone-500">
              気持ちの重なり：{ground.emotions.map((e) => e.label).join('・')}
            </p>
          )}

          <p className="text-xs leading-relaxed text-stone-500">
            どう渡すかは書きません。重なっているところを並べるだけにしてあります。
          </p>
        </section>
      )}

      {cannot && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm leading-relaxed text-amber-800">
          {cannot}
        </p>
      )}

      {combined && (
        <section ref={combinedRef} className="flex flex-col gap-2 scroll-mt-3">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h2 className="text-sm font-bold text-enji">組み合わせたもの</h2>
            <p className="text-xs text-stone-500">
              つなぎ目の［　］だけ、ご自身の言葉で埋めてください
            </p>
          </div>
          <NetaCard
            neta={combined}
            saved={savedIds.includes(combined.id)}
            onSave={saveCombined}
            defaultView="prose"
            rating={ratingOf(combined.id)}
            onRate={rate}
          />
        </section>
      )}

      {list.map((item) => (
        <NetaCard
          key={item.neta.id}
          neta={item.neta}
          saved
          onSave={() => {}}
          onRemove={remove}
          picked={picked.includes(item.neta.id)}
          onPick={list.length > 1 ? togglePick : undefined}
          rating={ratingOf(item.neta.id)}
          onRate={rate}
        >
          <div className="mt-3">
            <label className="label" htmlFor={`memo-${item.neta.id}`}>
              自分のメモ（どこで使うか、誰に話すか）
            </label>
            <textarea
              id={`memo-${item.neta.id}`}
              value={item.memo}
              onChange={(e) => setList(savedStore.updateMemo(item.neta.id, e.target.value))}
              rows={2}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              placeholder="例：来月の月参り、Aさんのお宅で"
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => copyBrief([item], 'この一件の指示書')}
              >
                この一件をAIに渡す
              </button>
              <span className="text-xs text-stone-400">
                {new Date(item.savedAt).toLocaleString('ja-JP')} に保存
              </span>
            </div>
          </div>
        </NetaCard>
      ))}

      {picked.length > 0 && (
        <div className="fixed inset-x-0 bottom-[calc(44px+env(safe-area-inset-bottom))] z-20 border-t border-stone-200 bg-white/95 px-4 py-2.5 backdrop-blur sm:bottom-0">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2">
            <span className="text-sm">
              ネタ帳から<span className="font-bold text-enji">{picked.length}件</span>
            </span>
            <button
              type="button"
              className="btn-primary"
              disabled={picked.length < 2}
              onClick={combine}
            >
              {picked.length < 2 ? 'あと1件えらぶと組めます' : '組み合わせて一本にする'}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setPicked([])
                setCombined(null)
                setCannot(null)
              }}
            >
              えらび直す
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
