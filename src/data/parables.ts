import type { Story } from './types'

/**
 * 今の暮らしからの、たとえ。
 *
 * 経典の喩えは、置き換えの一手間がいる。
 * 「琴の弦を張りすぎても」と言われて、琴を触ったことのない人が何人いるか。
 * ここにあるのは出典のない、ただの見立て。そのぶん、そのまま通じる。
 *
 * 経典の話として語らないこと。「たとえばの話ですが」で始めれば十分。
 * 自分の暮らしの一件に置き換えてもらうほうが、もっとよい。
 */
const SOURCE = '現代のたとえ（出典はありません）'
const CAUTION = '経典の話ではありません。「たとえばの話ですが」と断るか、ご自分の一件に置き換えて語ってください。'

export const PARABLES: Story[] = [
  {
    id: 'p-juuden',
    title: 'スマホの充電',
    kind: '今の話',
    source: SOURCE,
    summary:
      '残り二十パーセントを切ると、急に焦る。コンセントを探して、見つかると安心する。ところが刺した瞬間に、もう充電のことは忘れている。減っているあいだだけ、電気のことを考えている。',
    point: 'ふだんは有難みに気づかない、という話に。満ちているときは誰も数えない。',
    emotions: ['kansha', 'fuan', 'yasuragi', 'isogashii', 'munashisa'],
    topics: ['atarimae', 'isogashii'],
    keywords: ['充電', 'スマホ', '電池', 'バッテリー'],
    caution: CAUTION,
  },
  {
    id: 'p-recipe',
    title: 'レシピどおりに作ったのに',
    kind: '今の話',
    source: SOURCE,
    summary:
      '分量どおり、手順どおりに作ったのに、動画の味にならない。鍋が違う、火加減が違う、その日の湿気が違う。材料だけでは、味は決まらない。',
    point: '条件がそろって初めて起こる、という話に。努力が足りないのではない場面で。',
    emotions: ['mukuwarenai', 'aseri', 'jikokeno', 'hikaku', 'iraira'],
    topics: ['mukuwarenai', 'wakaranai'],
    keywords: ['レシピ', '料理', 'うまくいかな', '同じようにやった'],
    caution: CAUTION,
  },
  {
    id: 'p-tsuuchi',
    title: '通知バッジを消すために開く',
    kind: '今の話',
    source: SOURCE,
    summary:
      'アプリの赤い丸が気になって開く。読みたかったわけではない。赤い丸を消したかっただけ。消えると、内容はもう覚えていない。',
    point: '気になることに追われて、中身を見ていない、という話に。',
    emotions: ['isogashii', 'fuan', 'aseri', 'munashisa', 'tsukare'],
    topics: ['isogashii', 'sakinobashi'],
    keywords: ['通知', 'バッジ', 'アプリ', '既読', 'スマホ'],
    caution: CAUTION,
  },
  {
    id: 'p-subsc',
    title: '解約し忘れたサブスク',
    kind: '今の話',
    source: SOURCE,
    summary:
      '使っていないのに、毎月引き落とされている。気づいてはいる。解約の手順を調べるのが面倒で、また来月になる。損をしているのに、動くほうがしんどい。',
    point: 'やめたほうがいいと分かっていてやめられない、という話に。責めずに名指しする。',
    emotions: ['koukai', 'okane', 'jikokeno', 'mayoi', 'tsukare'],
    topics: ['sakinobashi', 'okane'],
    keywords: ['サブスク', '解約', '月額', '課金', 'やめられ'],
    caution: CAUTION,
  },
  {
    id: 'p-nabi',
    title: 'ルートを再検索します',
    kind: '今の話',
    source: SOURCE,
    summary:
      '道を間違えても、カーナビは叱らない。黙って引き返させることもしない。いまいる場所から、もう一度いちばん近い道を出してくる。戻らなくていい、ここからでいい、と言っている。',
    point: 'やり直しを、引き返しにしない話に。後悔している人へ。',
    emotions: ['koukai', 'jikokeno', 'zaiakukan', 'mayoi', 'hajimari'],
    topics: ['naoranai', 'hajimari'],
    keywords: ['ナビ', '道を間違', 'やり直', '引き返'],
    caution: CAUTION,
  },
  {
    id: 'p-yoshin',
    title: '写真フォルダの容量がいっぱい',
    kind: '今の話',
    source: SOURCE,
    summary:
      '消そうとして一枚ずつ見返すと、どれも消せない。結局、容量を買い足す。減らすつもりが、抱えるほうを増やしている。',
    point: '手放せないものを、無理に手放させない話に。',
    emotions: ['wakare', 'koukai', 'kansha', 'munashisa', 'henka'],
    topics: ['tebanasu'],
    keywords: ['写真', '容量', '消せな', '手放'],
    caution: CAUTION,
  },
  {
    id: 'p-sentaku',
    title: 'たたんだそばから崩される',
    kind: '今の話',
    source: SOURCE,
    summary:
      '洗濯物をたたんで積んだところに、子どもが飛び込んでくる。また一からたたむ。終わらせるためにやっていると腹が立つが、終わらないものだと思うと、少しだけ楽になる。',
    point: '家事・育児・介護の、終わりのない仕事の話に。',
    emotions: ['iraira', 'tsukare', 'kazoku', 'mukuwarenai', 'isogashii'],
    topics: ['owaranai'],
    keywords: ['洗濯', '家事', '子育て', '育児', '終わらな', 'きりがな'],
    caution: CAUTION,
  },
  {
    id: 'p-review',
    title: '星ひとつのレビュー',
    kind: '今の話',
    source: SOURCE,
    summary:
      '星五つが二十件ついていても、星ひとつの一件だけを何度も読み返す。ほめ言葉は一度で流れ、刺さった言葉だけが残って、夜になってまた開く。',
    point: '一本目の矢より、二本目を自分で射っている話に。',
    emotions: ['ochikomi', 'jikokeno', 'shounin', 'urami', 'iraira'],
    topics: ['miraretakata', 'ikari'],
    keywords: ['レビュー', '評価', '悪口', '言われた', '気にな'],
    caution: CAUTION,
  },
  {
    id: 'p-nyuuryoku',
    title: '入力中…のまま消える',
    kind: '今の話',
    source: SOURCE,
    summary:
      '相手の「入力中…」が出て、消えて、また出て、結局何も来ない。その数十秒のあいだに、こちらは十通りの話を勝手に作っている。実際には、子どもに呼ばれていただけかもしれない。',
    point: '相手の沈黙を、自分で埋めてしまう話に。人間関係の不安に。',
    emotions: ['fuan', 'ningenkankei', 'shounin', 'kodoku', 'aseri'],
    topics: ['miraretakata', 'hito'],
    keywords: ['既読', '返事', '入力中', 'LINE', '連絡'],
    caution: CAUTION,
  },
  {
    id: 'p-seru',
    title: 'セルフレジの向こうの人',
    kind: '今の話',
    source: SOURCE,
    summary:
      'セルフレジは早い。誰とも話さずに済む。ただ、バーコードが読めないとき、必ず誰かが来てくれる。ふだんは見えないところに、立っていてくれている。',
    point: '支えが見えない形で働いている、という話に。他力の入口に。',
    emotions: ['kansha', 'kodoku', 'yasuragi', 'mukuwarenai', 'fuan'],
    topics: ['tayoru', 'atarimae'],
    keywords: ['レジ', 'セルフ', '店員', 'ひとりで'],
    caution: CAUTION,
  },
  {
    id: 'p-nori',
    title: '一本前の電車を見送る',
    kind: '今の話',
    source: SOURCE,
    summary:
      '走れば間に合ったかもしれない一本を、見送る。次まで八分。ホームのベンチに座ったら、空がやけに広かった。急いでいたときには、上を見ていなかった。',
    point: '遅れることが損だけではない、という話に。焦りに。',
    emotions: ['aseri', 'isogashii', 'yasuragi', 'tsukare', 'henka'],
    topics: ['isogashii'],
    keywords: ['電車', '間に合わ', '遅れ', '急い'],
    caution: CAUTION,
  },
  {
    id: 'p-kensaku',
    title: '検索履歴',
    kind: '今の話',
    source: SOURCE,
    summary:
      '夜中に調べたことが、そのまま残っている。症状、費用、転職、別れ方。人に言えないことほど、検索窓には打てる。誰にも言っていないつもりで、いちばん正直に打っている。',
    point: '本音は口ではなく手元に出ている、という話に。聞き手の本音を先に言う場面で。',
    emotions: ['fuan', 'kodoku', 'mayoi', 'zaiakukan', 'shounin'],
    topics: ['wakaranai', 'miraretakata'],
    keywords: ['検索', '調べ', '夜中', '眠れな'],
    caution: CAUTION,
  },
  {
    id: 'p-shashin',
    title: '同じ景色を撮る人',
    kind: '今の話',
    source: SOURCE,
    summary:
      '名所に着くと、まずカメラを構える。撮り終えてから、やっと自分の目で見る。撮らなかった人のほうが、長くその場に立っていた。',
    point: '残そうとして、その場にいなくなる話に。',
    emotions: ['isogashii', 'munashisa', 'yorokobi', 'kansha', 'hikaku'],
    topics: ['atarimae', 'isogashii'],
    keywords: ['写真', '撮っ', 'カメラ', '映え'],
    caution: CAUTION,
  },
  {
    id: 'p-kaitou',
    title: '既読をつけずに読む',
    kind: '今の話',
    source: SOURCE,
    summary:
      '通知の画面で本文だけ読んで、開かない。読んだのに、読んでいないことにする。返事を考える時間がほしいだけなのに、相手には無視に見える。',
    point: '間を取ることが、冷たさに見える話に。すれ違いに。',
    emotions: ['ningenkankei', 'zaiakukan', 'fuan', 'kodoku', 'shounin'],
    topics: ['hito', 'miraretakata'],
    keywords: ['既読', '未読', '返事', 'LINE', '無視'],
    caution: CAUTION,
  },
  {
    id: 'p-point',
    title: 'ポイントの期限',
    kind: '今の話',
    source: SOURCE,
    summary:
      '失効が近いと通知が来て、要らないものを買う。得をするために、余計に払っている。損したくない気持ちのほうが、得よりずっと強い。',
    point: '損得の計算が、かえって自分を縛る話に。',
    emotions: ['okane', 'hikaku', 'koukai', 'aseri', 'munashisa'],
    topics: ['okane', 'kuraberu'],
    keywords: ['ポイント', '期限', 'セール', '損', 'お得'],
    caution: CAUTION,
  },
  {
    id: 'p-manual',
    title: '説明書を読まずに使う',
    kind: '今の話',
    source: SOURCE,
    summary:
      '新しい家電は、だいたい触って覚える。困ってから説明書を出す。読んだら、はじめのページに書いてあった。',
    point: '聞いていたはずのことに、あとで出会い直す話に。聞法の入口に。',
    emotions: ['koukai', 'mayoi', 'jikokeno', 'hajimari', 'ochikomi'],
    topics: ['wakaranai', 'naoranai'],
    keywords: ['説明書', 'マニュアル', '後から', '知らなかった'],
    caution: CAUTION,
  },
  {
    id: 'p-yoyaku',
    title: '予定を詰めた休日',
    kind: '今の話',
    source: SOURCE,
    summary:
      'せっかくの休みだからと、朝から予定を三つ入れる。移動と時間を気にして、どれも半分しか味わえない。何もしなかった日のほうを、あとでよく思い出す。',
    point: '充実させようとして、薄くなる話に。',
    emotions: ['isogashii', 'tsukare', 'munashisa', 'aseri', 'yasuragi'],
    topics: ['isogashii', 'owaranai'],
    keywords: ['休み', '予定', '詰め', '休めな'],
    caution: CAUTION,
  },
  {
    id: 'p-kagami',
    title: 'インカメラで自分を見る',
    kind: '今の話',
    source: SOURCE,
    summary:
      'ふいにインカメラが起動して、思ってもみない角度の自分が映る。鏡で見ていた顔とは別人。人が見ていたのは、こちらのほうだった。',
    point: '自分の思う自分と、人から見えている自分の落差に。',
    emotions: ['jikokeno', 'shounin', 'hikaku', 'ochikomi', 'mayoi'],
    topics: ['naoranai', 'miraretakata'],
    keywords: ['鏡', '自分の顔', '写真写り', 'インカメ'],
    caution: CAUTION,
  },
]

export const PARABLE_BY_ID: Record<string, Story> = Object.fromEntries(
  PARABLES.map((s) => [s.id, s]),
)
