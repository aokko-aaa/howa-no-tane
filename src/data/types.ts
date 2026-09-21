// 法話ネタの素材となるデータの型。
// 設計の軸: 「入口は一般の人の思考起点、出口が仏教」。
// どの素材も「世間ではこう受け取られている(misread/now/scene)」と
// 「仏教から見るとこうズレる(pivot/gap/point)」の対で持つ。

export type EmotionId = string

/** 素材の系統。指定がなければ宗派を問わない共通のもの。 */
export type Tradition = 'shinshu' | 'zen' | 'common'

/** 出し方のモード。既定は真宗大谷派を優先する。 */
export type TraditionMode = 'otani' | 'any'

export type EmotionGroup = 'くるしみ' | 'ざわつき' | 'しあわせ' | 'ゆらぎ'

export type Emotion = {
  id: EmotionId
  label: string
  group: EmotionGroup
  /** 一般の人が実際に口にする言い方 */
  plain: string
  /** 自由記述から拾うための語 */
  keywords: string[]
  /** 一段掘るときの問いかけ（「なんで？」「何が？」など） */
  question: string
}

/**
 * 気持ちの一段下。「イライラする」だけでは当てようがないので、
 * 「なんで？」まで降りてから素材を選ぶための枝。
 */
export type Reason = {
  id: string
  label: string
  /** この理由で足される気持ち */
  emotions: EmotionId[]
  /** とくに当たりやすい仏教語 */
  concepts?: string[]
}

/** 仏教語・教義 */
export type Concept = {
  id: string
  term: string
  reading: string
  /** 一行で意味（仏教語を使わずに） */
  oneLine: string
  source: string
  /**
   * この言葉が答えている問い。聴き手の言葉で、教義の語を使わずに書く。
   * 法話は答えから始めると説教になる。先に問いを置いて、答えは渡さずに帰ってもらう。
   */
  question: string
  /** 一般の人の実感に寄せた言い換え */
  everyday: string
  /** 世間でのありがちな受け取り方（＝話の入口にできる誤解） */
  misread: string
  /** そこからの視座のズラし（＝落差＝話の山） */
  pivot: string
  /** 日常への落とし込み（聴き手が今日できる一歩） */
  step: string
  emotions: EmotionId[]
  keywords?: string[]
  /**
   * 話の大きさ。入口の場面と桁が合っていないと、こじつけ以前に届かない。
   * 1=今日の暮らしの寸法（足元・言葉づかい・段取り）
   * 2=人生の局面（関係・立場・変わり目）
   * 3=いのち・救い・往生（語るのに場が要る）
   */
  scale?: 1 | 2 | 3
  /** 出典や扱いに注意がいる場合のメモ */
  caution?: string
  tradition?: Tradition
}

/** 経典の喩え・説話・祖師の逸話 */
export type Story = {
  id: string
  title: string
  kind: '経典' | '説話' | '禅' | '祖師' | '近代' | '今の話'
  source: string
  /** そのまま語れる長さの要約 */
  summary: string
  /** この話の使いどころ・落としどころ */
  point: string
  emotions: EmotionId[]
  /** 書かれた文から拾うための語 */
  keywords?: string[]
  caution?: string
  tradition?: Tradition
}

/** 日常語になっている仏教語（入口を広げるための素材） */
export type Word = {
  id: string
  word: string
  reading: string
  /** 仏教でのもとの意味 */
  origin: string
  /** 今の使われ方 */
  now: string
  /** そのズレのどこが話になるか */
  gap: string
  emotions: EmotionId[]
  caution?: string
  tradition?: Tradition
}

/** 現代の入口（一般の人の思考起点になる場面） */
export type Modern = {
  id: string
  scene: string
  /** そのまま語り出しに使える一文 */
  line: string
  emotions: EmotionId[]
  keywords?: string[]
  /** この場面では使わない（通夜・葬儀で軽く響くものなど） */
  avoidScenes?: SceneId[]
}

/** 年中行事・節目（季節に寄せる切り口の素材） */
export type Occasion = {
  id: string
  name: string
  months: number[]
  hook: string
  tradition?: Tradition
  caution?: string
}

/** 仏教の人物の小ネタ。教義ではなく、人の話として入るための素材 */
export type Figure = {
  id: string
  /** 空海（弘法大師） */
  name: string
  /** 774–835・平安 のような短い添え */
  era: string
  /** その人の、ひとことでの通り名 */
  title: string
  /** 小ネタ本体。そのまま語れる長さ */
  story: string
  /** 法話での使いどころ */
  hook: string
  /** いまの暮らしとの接点（たくあん・お茶・だるま…） */
  everyday?: string
  emotions: EmotionId[]
  keywords?: string[]
  caution?: string
  tradition?: Tradition
}

/** お聖教の一句（真宗の法話は、ここから始めることが多い） */
export type Phrase = {
  id: string
  /** 読み下し、または漢文のまま */
  text: string
  reading?: string
  source: string
  /** ふだんの言葉での受け取り */
  gloss: string
  /** どんな場で効くか */
  use: string
  emotions: EmotionId[]
  caution?: string
}

/** 真宗大谷派で気をつける言い回し・作法 */
export type Manner = {
  id: string
  /** 使わない（使われがちな）言い方 */
  avoid: string
  /** 代わりに使う言い方 */
  use: string
  /** なぜそうなるのか */
  why: string
  /** 葬儀・法事など、特に効く場面 */
  scenes?: string[]
  caution?: string
}

/** 切り口のテンプレート */
export type AngleKind = 'concept' | 'story' | 'word'

export type Angle = {
  id: string
  name: string
  /** 'shinshu' の切り口は、真宗大谷派モードのときだけ出す */
  tradition?: Tradition
  /** この切り口のねらい */
  aim: string
  /** 組み立てに必要な素材 */
  needs: AngleKind[]
  /** こじつけ度 1=素直 2=ひとひねり 3=こじつけ全開 */
  kojitsuke: 1 | 2 | 3
}

/** 話す場面 */
export type SceneId = 'houji' | 'tsukimairi' | 'sougo' | 'howakai' | 'keijiban' | 'sns'

export type Scene = {
  id: SceneId
  label: string
  note: string
  /** 目安の尺（分）。掲示板・SNSは0 */
  minutes: number
}

export type NetaSection = {
  label: string
  body: string
}

/** その案がどの素材で組まれたか */
export type NetaMaterials = {
  conceptId?: string
  storyId?: string
  wordId?: string
  figureId?: string
  modernId?: string
  /** 入口の場面と語り出し。自分で書いた一件（modernId='typed'）は内蔵データに無いので、ここに残す */
  modernScene?: string
  modernLine?: string
  occasionId?: string
  phraseId?: string
}

export type Neta = {
  id: string
  angleId: string
  angleName: string
  aim: string
  kojitsuke: 1 | 2 | 3
  title: string
  sections: NetaSection[]
  /**
   * ひと目で筋が分かる要点。項目を並べるのではなく、順に読めば話が通る形にする。
   * （ラベルを並べただけでは、つながりが見えずに意味が取れない）
   */
  digest?: {
    /** この案がひとことで言っていること */
    summary: string
    /** 入口から今日の一歩まで、順に並べた筋道 */
    steps: string[]
    /** 入口の場面と尺。差し替えの手がかり */
    note: string
  }
  /** その場で入れ替えられる候補（入口の場面・切り口） */
  alternatives?: { modernIds: string[]; angleIds: string[] }
  sources: string[]
  cautions: string[]
  materials: NetaMaterials
  /**
   * 組み合わせでできた案が、もとの案それぞれの素材を覚えておくためのもの。
   * materials には各種ひとつしか入らないので、これが無いと
   * 「組んだものを、さらに組む」たびに素材が落ちていく。
   */
  sourceMaterials?: NetaMaterials[]
  /** この案がどの系統の素材で組まれたか */
  tradition: Tradition
  minutes: number
}
