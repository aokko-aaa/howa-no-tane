import { useEffect, useMemo, useRef, useState } from 'react'
import ChartView from './components/ChartView'
import DictView from './components/DictView'
import NewsView from './components/NewsView'
import EmotionPicker from './components/EmotionPicker'
import NetaCard from './components/NetaCard'
import SavedView from './components/SavedView'
import { ANGLES, SCENES } from './data/angles'
import { CONCEPTS } from './data/concepts'
import { reasonsFor } from './data/reasons'
import { PHRASES } from './data/shinshu/phrases'
import { STORIES } from './data/stories'
import { WORDS } from './data/words'
import type { EmotionId, Neta, SceneId, TraditionMode } from './data/types'
import { generateNeta, swapMaterial, type GenerateInput, type Pins } from './lib/generate'
import { detectEmotions } from './lib/match'
import { savedStore } from './lib/storage'

type Tab = 'make' | 'news' | 'chart' | 'book' | 'dict'

const TABS: { id: Tab; label: string }[] = [
  { id: 'make', label: 'つくる' },
  { id: 'news', label: '話題から' },
  { id: 'chart', label: 'くらし' },
  { id: 'book', label: 'ネタ帳' },
  { id: 'dict', label: 'ことば' },
]

const BATCH = 6

export default function App() {
  const [tab, setTab] = useState<Tab>('make')
  const [text, setText] = useState('')
  const [emotions, setEmotions] = useState<EmotionId[]>([])
  const [reasons, setReasons] = useState<string[]>([])
  const [sceneId, setSceneId] = useState<SceneId>('howakai')
  const [kojitsukeMax, setKojitsukeMax] = useState<1 | 2 | 3>(2)
  const [tradition, setTradition] = useState<TraditionMode>('otani')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [results, setResults] = useState<Neta[]>([])
  const [pins, setPins] = useState<Pins>({})
  const resultsRef = useRef<HTMLElement>(null)
  const [openPins, setOpenPins] = useState(false)
  const [savedIds, setSavedIds] = useState<string[]>([])

  useEffect(() => {
    setSavedIds(savedStore.list().map((x) => x.neta.id))
  }, [])

  const detected = useMemo(() => detectEmotions(text), [text])
  /** 選んだ気持ちが無ければ、書かれた文から拾ったものを使う */
  const effective = emotions.length > 0 ? emotions : detected

  const pinCount = Object.values(pins).filter(Boolean).length
  const setPin = (key: keyof Pins, value: string) =>
    setPins((prev) => ({ ...prev, [key]: value || undefined }))

  const toggle = (id: EmotionId) => {
    setEmotions((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    // 気持ちを外したら、その下で選んでいた理由も外す
    setReasons((prev) => prev.filter((r) => !reasonsFor(id).some((x) => x.id === r)))
  }

  const toggleReason = (id: string) =>
    setReasons((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  /** 気持ちを選んだら、そのまま出す。押す手間を一つ減らす。 */
  useEffect(() => {
    if (effective.length === 0) return
    const t = setTimeout(() => runWith('new', false), 300)
    return () => clearTimeout(t)
    // 気持ちと理由が変わったときだけ。文の入力中は走らせない。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emotions.join(','), reasons.join(','), sceneId, tradition, kojitsukeMax, month])

  const run = (mode: 'new' | 'more') => runWith(mode, true)

  const runWith = (mode: 'new' | 'more', scroll: boolean) => {
    const seed = Math.floor(Math.random() * 1e9)
    const next = generateNeta({
      text,
      emotions: effective,
      sceneId,
      month,
      kojitsukeMax,
      tradition,
      reasonIds: reasons,
      seed,
      count: BATCH,
      pins,
    })
    // ページの先頭ではなく、結果の頭へ寄せる。
    // 「もっと」のときは、いま足りた分の先頭へ。
    const anchorId = mode === 'more' ? next[0]?.id : undefined
    setResults((prev) => (mode === 'more' ? [...prev, ...next] : next))
    if (!scroll) return
    requestAnimationFrame(() => {
      const target = anchorId
        ? document.getElementById(`neta-${anchorId}`)
        : resultsRef.current
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  /** 入口や切り口が自分に合わないとき、その場で次の候補に差し替える */
  const swap = (neta: Neta, kind: 'modern' | 'angle') => {
    const base: Omit<GenerateInput, 'pins' | 'count' | 'seed'> = {
      text,
      emotions: effective,
      sceneId,
      month,
      kojitsukeMax,
      tradition,
      reasonIds: reasons,
    }
    const next = swapMaterial(neta, base, kind, Math.floor(Math.random() * 1e9))
    setResults((prev) => prev.map((n) => (n.id === neta.id ? next : n)))
  }

  const save = (neta: Neta) => {
    savedStore.add({
      neta,
      memo: '',
      savedAt: new Date().toISOString(),
      fromEmotions: effective,
      fromText: text,
    })
    setSavedIds((prev) => [...prev, neta.id])
  }

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 pb-24 pt-4">
      <header className="mb-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-xl font-bold tracking-wide">法話の種</h1>
          <p className="text-sm text-stone-600">その気持ちに、仏教はもう名前をつけている</p>
        </div>
        <details className="mt-1 text-xs text-stone-500">
          <summary className="cursor-pointer">これは何？</summary>
          <div className="mt-1.5 space-y-1 leading-relaxed">
            <p>
              教義から降りるのではなく、
              <span className="font-bold">一般の人が立ち止まる場面</span>
              から始めて、仏教へ渡すための下ごしらえ帳です。
            </p>
            <p>
              既定は<span className="font-bold">真宗大谷派</span>
              （お聖教・御文・歎異抄・報恩）を優先します。
            </p>
            <p>
              お寺の方でなければ、<span className="font-bold">「くらし」</span>
              へ。毎日使っている言葉の出どころと、いまの気持ちに合う話が読めます。
            </p>
            <p>引用はそのまま使わず、出典に当たってから語ってください。</p>
          </div>
        </details>
      </header>

      <nav className="mb-4 flex gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`chip ${tab === t.id ? 'chip-on' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.id === 'book' && savedIds.length > 0 ? `（${savedIds.length}）` : ''}
          </button>
        ))}
      </nav>

      {tab === 'make' && (
        <div className="flex flex-col gap-5">
          <section className="card px-4 py-4">
            <label className="label" htmlFor="text">
              どんな話を聞いた？　何があった？（書かなくても出ます）
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="例：同級生のSNSを見て、おめでとうと打ちながら気持ちが沈んだ／親に同じことを三度聞かれて、つい強い声が出た"
              className="mt-1.5 w-full rounded-lg border border-stone-300 px-3 py-2 text-[15px] leading-relaxed"
            />
            {detected.length > 0 && emotions.length === 0 && (
              <p className="mt-1.5 text-xs text-enji">
                文から拾いました：{detected.join(' / ')}　このまま出せます
              </p>
            )}
          </section>

          <section className="card px-4 py-4">
            <div className="label mb-2">気持ち（いくつでも）</div>
            <EmotionPicker
              selected={emotions}
              onToggle={toggle}
              detected={detected}
              reasons={reasons}
              onToggleReason={toggleReason}
            />
          </section>

          <section className="card flex flex-col gap-4 px-4 py-4">
            <div>
              <div className="label mb-2">どこで使う</div>
              <div className="flex flex-wrap gap-1.5">
                {SCENES.map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    className={`chip ${sceneId === sc.id ? 'chip-on' : ''}`}
                    onClick={() => setSceneId(sc.id)}
                    title={sc.note}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-stone-500">
                {SCENES.find((x) => x.id === sceneId)?.note}
                {(SCENES.find((x) => x.id === sceneId)?.minutes ?? 0) === 0
                  ? '（一行と短文で出します）'
                  : `（目安 ${SCENES.find((x) => x.id === sceneId)?.minutes}分）`}
              </p>
            </div>

            <div>
              <div className="label mb-2">どの教えで出す</div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  className={`chip ${tradition === 'otani' ? 'chip-on' : ''}`}
                  onClick={() => setTradition('otani')}
                >
                  真宗大谷派を優先
                </button>
                <button
                  type="button"
                  className={`chip ${tradition === 'any' ? 'chip-on' : ''}`}
                  onClick={() => setTradition('any')}
                >
                  宗派を問わない
                </button>
              </div>
              <p className="mt-1.5 text-xs text-stone-500">
                {tradition === 'otani'
                  ? 'お聖教・御文・歎異抄を先に回し、大谷派の言い回しの注意を添えます'
                  : '宗派を問わない素材だけで組みます'}
              </p>
            </div>

            <details>
              <summary className="cursor-pointer text-sm">
                <span className="font-bold">詳しい設定</span>
                <span className="ml-2 text-xs text-stone-500">
                  {kojitsukeMax === 1 ? '素直に' : kojitsukeMax === 2 ? 'ひとひねり' : '全開'}／{month}月
                  {pinCount > 0 ? `／素材${pinCount}件` : ''}
                </span>
              </summary>
              <div className="mt-3 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <div className="label mb-1.5">こじつけ度</div>
                <div className="flex gap-1.5">
                  {([1, 2, 3] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      className={`chip ${kojitsukeMax === k ? 'chip-on' : ''}`}
                      onClick={() => setKojitsukeMax(k)}
                    >
                      {k === 1 ? '素直に' : k === 2 ? 'ひとひねり' : '全開'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label mb-1.5 block" htmlFor="month">
                  月（行事の切り口に使う）
                </label>
                <select
                  id="month"
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="min-h-tap rounded-lg border border-stone-300 px-3 py-2 text-sm"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {m}月
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <button
                type="button"
                className="label flex items-center gap-1 underline"
                onClick={() => setOpenPins((v) => !v)}
              >
                {openPins ? '条件を閉じる' : '素材を指定して探す'}
                {pinCount > 0 ? `（${pinCount}件 指定中）` : ''}
              </button>

              {openPins && (
                <div className="mt-2 flex flex-col gap-3 rounded-lg bg-stone-50 px-3 py-3">
                  <p className="text-xs leading-relaxed text-stone-500">
                    「この言葉で」「この一句で」「この切り口で」と決めて探せます。
                    指定しない欄は、気持ちに合わせてこちらで選びます。
                  </p>

                  <div>
                    <label className="label mb-1 block" htmlFor="pin-concept">
                      仏教語
                    </label>
                    <select
                      id="pin-concept"
                      value={pins.conceptId ?? ''}
                      onChange={(e) => setPin('conceptId', e.target.value)}
                      className="min-h-tap w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                    >
                      <option value="">指定しない</option>
                      <optgroup label="真宗大谷派">
                        {CONCEPTS.filter((c) => c.tradition === 'shinshu').map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.term}（{c.oneLine}）
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="宗派を問わない・禅">
                        {CONCEPTS.filter((c) => c.tradition !== 'shinshu').map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.term}（{c.oneLine}）
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="label mb-1 block" htmlFor="pin-phrase">
                      お聖教の一句
                    </label>
                    <select
                      id="pin-phrase"
                      value={pins.phraseId ?? ''}
                      onChange={(e) => setPin('phraseId', e.target.value)}
                      className="min-h-tap w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                    >
                      <option value="">指定しない</option>
                      {PHRASES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.text.slice(0, 22)}
                          {p.text.length > 22 ? '…' : ''}／{p.source}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label mb-1 block" htmlFor="pin-angle">
                      切り口
                    </label>
                    <select
                      id="pin-angle"
                      value={pins.angleId ?? ''}
                      onChange={(e) => setPin('angleId', e.target.value)}
                      className="min-h-tap w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                    >
                      <option value="">指定しない</option>
                      {ANGLES.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}（{a.aim}）
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="flex-1">
                      <label className="label mb-1 block" htmlFor="pin-story">
                        喩え・逸話
                      </label>
                      <select
                        id="pin-story"
                        value={pins.storyId ?? ''}
                        onChange={(e) => setPin('storyId', e.target.value)}
                        className="min-h-tap w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                      >
                        <option value="">指定しない</option>
                        {STORIES.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="label mb-1 block" htmlFor="pin-word">
                        日常語
                      </label>
                      <select
                        id="pin-word"
                        value={pins.wordId ?? ''}
                        onChange={(e) => setPin('wordId', e.target.value)}
                        className="min-h-tap w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                      >
                        <option value="">指定しない</option>
                        {WORDS.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.word}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {pinCount > 0 && (
                    <button
                      type="button"
                      className="btn-ghost self-start"
                      onClick={() => setPins({})}
                    >
                      条件をすべて外す
                    </button>
                  )}
                </div>
              )}
            </div>

              </div>
            </details>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button type="button" className="btn-primary" onClick={() => run('new')}>
                {pinCount > 0
                  ? `この条件で${results.length > 0 ? '探し直す' : '探す'}`
                  : `切り口を${results.length > 0 ? '出し直す' : '出す'}`}
              </button>
              {results.length > 0 && (
                <button type="button" className="btn-ghost" onClick={() => run('more')}>
                  別の切り口をもっと
                </button>
              )}
              <span className="text-xs text-stone-500">
                {effective.length > 0 ? `${effective.length}つの気持ちから` : '気持ちを選ぶと寄せられます'}
              </span>
            </div>
          </section>

          {results.length > 0 && (
            <section ref={resultsRef} className="flex flex-col gap-3 scroll-mt-3">
              <p className="text-xs text-stone-500">
                違う入り方を{results.length}通り。ぴんと来なければ〈出し直す〉。
              </p>
              {results.map((n) => (
                <div key={n.id} id={`neta-${n.id}`} className="scroll-mt-3">
                <NetaCard
                  neta={n}
                  saved={savedIds.includes(n.id)}
                  onSave={save}
                  onSwap={swap}
                />
                </div>
              ))}
              <button type="button" className="btn-ghost self-start" onClick={() => run('more')}>
                別の切り口をもっと
              </button>
            </section>
          )}
        </div>
      )}

      {tab === 'news' && (
        <NewsView
          sceneId={sceneId}
          tradition={tradition}
          kojitsukeMax={kojitsukeMax}
          month={month}
          savedIds={savedIds}
          onSave={save}
        />
      )}
      {tab === 'chart' && (
        <ChartView tradition={tradition} savedIds={savedIds} onSave={save} />
      )}
      {tab === 'book' && <SavedView />}
      {tab === 'dict' && <DictView />}

      <footer className="mt-10 border-t border-stone-200 pt-4 text-xs leading-relaxed text-stone-500">
        出典は通称です。語る前に原典をご確認ください。諸説あるものはカードの「語る前に確認」に出ます。
        入力と保存は、この端末の中だけに残ります。
      </footer>
    </div>
  )
}
