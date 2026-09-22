import type { Take } from './types'

/**
 * 話の案。
 *
 * 「南無阿弥陀仏でどういう話ができるか」——ここに答えるものは、
 * 素材の組み合わせからは出てこない。一案ずつ書くしかない。
 *
 * 書くときの決まり：
 * - 芯は二、三文。長く書くと、語り手が自分の言葉に直しにくい
 * - 入口は現代の場面。複数出して、選べるようにする
 * - 典拠は確かなものだけ。領解（受け取り方）は typo ではなく caution に書く
 * - 真宗大谷派の受け取りに沿う。よその宗派の言い方を混ぜない
 */
export const TAKES: Take[] = [
  // ───────── 南無阿弥陀仏 ─────────
  {
    id: 'namu-1',
    ofKind: 'concept',
    ofId: 'namuamidabutsu',
    title: 'お願いと、呼び声',
    core:
      '手を合わせるとき、私たちはたいてい「お願いします」と言っている。けれども帰命とは、本願招喚の勅命——向こうから呼ばれている声のほう。称えるのは、頼むことではなく、答えること。',
    openings: ['初詣の列', '合格祈願のお守り', '賽銭を入れる手'],
    step: '今日、手を合わせたとき、頼みごとを言わずにただ称えてみる。',
    source: '「帰命は本願招喚の勅命なり」（『教行信証』行巻・六字釈）',
  },
  {
    id: 'namu-2',
    ofKind: 'concept',
    ofId: 'namuamidabutsu',
    title: '誰の声が、誰の口から出ているか',
    core:
      '称えているのは私のつもりでいる。けれども「われにまかせよ」という喚び声が、私の口から出てくださっていると受け取る。主語がひっくり返る。',
    openings: ['気づいたら親と同じことを言っている', '子どもが親の口ぶりを真似る'],
    openingIds: ['oya-sumaho'],
    step: '口に出た「なんまんだぶ」の主語を、一度だけ疑ってみる。',
    caution: '領解の言い方は先達によって異なる。自分の言葉に直して語ること。',
  },
  {
    id: 'namu-3',
    ofKind: 'concept',
    ofId: 'namuamidabutsu',
    title: '返事は、呼ばれた者にしかできない',
    core:
      '返事という形は、先に呼ぶ声がなければ成り立たない。念仏が返事だとすれば、こちらが始めたのではない。',
    openings: ['玄関で「ただいま」と言わなくなった一人暮らし', '返事のない部屋'],
    openingIds: ['muon'],
    step: '今日、返事をひとつ、声に出す。',
  },
  {
    id: 'namu-4',
    ofKind: 'concept',
    ofId: 'namuamidabutsu',
    title: '数ではない',
    core:
      '何遍称えたら足りるのか、という問いが出る。けれども回数を数えはじめた時点で、こちらの手柄の話になっている。',
    openings: ['歩数計', 'ポイントカード', 'ラジオ体操のハンコ'],
    openingIds: ['hosuu', 'hanko'],
    step: '今日は数えずに、一遍だけ。',
    caution: '一念多念の論に触れる。どちらかを退ける言い方にしないこと。',
  },
  {
    id: 'namu-5',
    ofKind: 'concept',
    ofId: 'namuamidabutsu',
    title: 'なぜ、声に出す形なのか',
    core:
      '心で思うだけでよいなら、声はいらない。名号は称えられる形で私のところへ来ている。だから字が読めなくても、覚えられなくても届く。',
    openings: ['手書きの手紙', '留守電に残った声'],
    openingIds: ['tegami'],
    step: '一度、声に出してみる。',
  },

  // ───────── 本願 ─────────
  {
    id: 'hongan-1',
    ofKind: 'concept',
    ofId: 'hongan',
    title: '願いの主語',
    core:
      '「本願を果たす」と世間では言う。自分の願いのことだ。けれども本願は、私の願いではなく、私を願っている側の願い。願う側から、願われている側へ、自分を置き直す言葉。',
    openings: ['合格祈願の絵馬', '手帳の目標欄', '「夢を叶える」という言い方'],
    step: '自分の願いを数える前に、誰かに願われていた場面を一つ思い出す。',
  },
  {
    id: 'hongan-2',
    ofKind: 'concept',
    ofId: 'hongan',
    title: '折れた願いのほう',
    core:
      '「こうなりたい」という私の願いは、たいてい途中で折れる。それでも話が終わらないのは、こちらの願いが芯ではないから。',
    openings: ['年始に立てた目標', 'やめてしまった習い事', '続かなかった日記'],
    openingIds: ['hanko'],
    step: '折れた願いを一つ思い出して、責めずに書いておく。',
  },
  {
    id: 'hongan-3',
    ofKind: 'concept',
    ofId: 'hongan',
    title: '選り分けていない',
    core:
      '第十八願は「十方衆生」と言う。条件で選り分けていない。選ばれた者の話ではないところが、この願の特徴。',
    openings: ['選考の通知', '抽選の当落', '審査の結果'],
    step: '今日、誰かを選り分けて見ていた自分に気づく。',
    source: '『大無量寿経』第十八願',
  },
  {
    id: 'hongan-4',
    ofKind: 'concept',
    ofId: 'hongan',
    title: '五劫のあいだ考えられた',
    core:
      '思いつきの願いではない、と説かれる。考えに考えた末に立てられた願だと聞くと、こちらの受け取り方が変わる。',
    openings: ['長く迷ってようやく決めたこと', '何年も温めていた話'],
    step: '即答しなかったことを一つ、思い出す。',
    caution: '五劫は年数の話に持ち込まない。長さを表す言い方として扱う。',
  },

  // ───────── 他力 ─────────
  {
    id: 'tariki-1',
    ofKind: 'concept',
    ofId: 'tariki',
    title: '「他力本願」の誤用から入る',
    core:
      '世間では他人任せの意味で使われている。親鸞聖人は「他力といふは如来の本願力なり」と書かれた。他人の力ではなく、如来のはたらきのこと。取り違えがここまで広まったこと自体が、話の入口になる。',
    openings: ['ニュースの「他力本願ではいけない」', '会議で聞いたあの言い方'],
    step: '今日「他力本願」と聞いたら、心の中で一度だけ直してみる。',
    source: '『教行信証』行巻',
  },
  {
    id: 'tariki-2',
    ofKind: 'concept',
    ofId: 'tariki',
    title: '倒れてから気づく',
    core: '自分の力で立っていたつもりが、倒れてみて初めて支えの多さに気づく。気づく順番は、たいてい逆になっている。',
    openings: ['入院した週', '骨折', '体調を崩して人に頼んだこと'],
    openingIds: ['byoushitsu', 'saikensa'],
    step: '今日、誰かの手が入っているものを三つ数える。',
  },
  {
    id: 'tariki-3',
    ofKind: 'concept',
    ofId: 'tariki',
    title: '自力を捨てる、の意味',
    core:
      '何もしないことではない。自分の勘定を当てにしないこと。動くことと、当てにすることは別。',
    openings: ['人に頼めなかった仕事', '相談できずに抱えた一件'],
    openingIds: ['ai-soudan', 'muon'],
    step: '今日ひとつ、人に頼んでみる。断られてもかまわないことを一つ選んで。',
  },
  {
    id: 'tariki-4',
    ofKind: 'concept',
    ofId: 'tariki',
    title: '見えないところに立っている人',
    core:
      '誰とも話さずに済む仕組みほど、見えないところに人が立っている。困ったときだけ、その人が出てくる。',
    openings: ['セルフレジ', '無人の改札', '置き配'],
    step: '見えない手の話を一つ、人にしてみる。',
  },

  // ───────── 煩悩具足の凡夫 ─────────
  {
    id: 'bonbu-1',
    ofKind: 'concept',
    ofId: 'bonbu',
    title: '直ってから来い、とは言われていない',
    core:
      '世間では「人間しょせん愚かだ」という開き直りに聞こえる。真宗は、煩悩を持ったまま救いの目当てにされていると言う。順番が逆になっている。',
    openings: ['反省した翌日にまた同じこと', '禁煙の三日目', '同じことで同じ相手と'],
    openingIds: ['kaigi-ato', 'kodomo-shippai'],
    step: '直らなかったことを一つ、責めずに書き留める。',
  },
  {
    id: 'bonbu-2',
    ofKind: 'concept',
    ofId: 'bonbu',
    title: '具足、という言い方',
    core:
      '「まだ足りない」ではなく「そなわっている」と読む。減点の話ではない。そこが世間の物差しとまるきり違う。',
    openings: ['健康診断の数値', '通知表', '人事評価'],
    openingIds: ['saikensa', 'chuui'],
    step: '足りないところを数える癖を、一日だけ止めてみる。',
  },
  {
    id: 'bonbu-3',
    ofKind: 'concept',
    ofId: 'bonbu',
    title: '手本の人が、直らなかったと書き残している',
    core:
      '親鸞聖人ご自身が「悪性さらにやめがたし」と書かれた。手本にする人が、直らなかったと書き残している。そこに助かる人がいる。',
    openings: ['憧れの人の弱さを知ったとき', '完璧に見えた人の失敗'],
    step: '直らない自分のことを、誰かに一言だけ話す。',
    source: '『正像末和讃』愚禿悲歎述懐',
  },
  {
    id: 'bonbu-4',
    ofKind: 'concept',
    ofId: 'bonbu',
    title: '反省の上塗り',
    core:
      '反省が足りないから直らない、と私たちは考える。けれども反省を重ねるほど、自分を責める時間だけが増えていく。二本目の矢を自分で射っている。',
    openings: ['寝る前に思い出す一件', '何年も前の失敗が急に出てくる'],
    openingIds: ['kaigi-ato', 'kagami'],
    step: '今日、思い出して責めはじめたら、そこで数を数えてやめる。',
  },

  // ───────── 報恩 ─────────
  {
    id: 'houon-1',
    ofKind: 'concept',
    ofId: 'houon',
    title: '返すためではない',
    core:
      '恩返しは貸し借りの清算だと思われている。報恩は、返すために動くのではなく、受けていたと気づいたから動く。差し引きではなく、気づきのほうが先にある。',
    openings: ['親切にされて落ち着かなくなる', 'お返しを考えてしまう手'],
    openingIds: ['otoshimono', 'tegami'],
    step: '今日、返せそうにない恩を一つ数えて、そのままにしておく。',
  },
  {
    id: 'houon-2',
    ofKind: 'concept',
    ofId: 'houon',
    title: '報恩講は、してあげる日ではない',
    core:
      '法要は、こちらが何かをして差し上げる日ではない。受けていたことに気づかせていただく日。供養と報恩は、向きが逆になっている。',
    openings: ['お参りの支度', '親の命日', '仏花を替える手'],
    openingIds: ['butsudan'],
    step: '今年の報恩講で、誰かにしてもらっていたことを一つ探す。',
    caution: '大谷派では追善供養の語を使わない。供養ではなく報恩という一点を外さない。',
  },
  {
    id: 'houon-3',
    ofKind: 'concept',
    ofId: 'houon',
    title: '誰かが替えている花',
    core:
      '実家の仏壇の花だけが、いつも新しい。誰かが替えているからだ。数えたことのない手が、そこに毎週入っている。',
    openings: ['実家の仏壇', '掃除されている集会所', '直っている壊れもの'],
    openingIds: ['butsudan'],
    step: '今日、誰の手が入っているか分からないものを一つ見つける。',
  },
  {
    id: 'houon-4',
    ofKind: 'concept',
    ofId: 'houon',
    title: '返しきれないと知った者の歌',
    core:
      '恩徳讃は、返せる相手に返す歌ではない。返しきれないと知った者の、行き場のない気持ちがそのまま歌になっている。',
    openings: ['親に何も返せないまま', '世話になった人が先に亡くなった'],
    openingIds: ['nokosareta-fuku', 'soubetsu'],
    step: '返せなかった相手の名を、一人だけ思い出す。',
    source: '『正像末和讃』（恩徳讃）',
  },

  // ───────── 摂取不捨 ─────────
  {
    id: 'sesshu-1',
    ofKind: 'concept',
    ofId: 'sesshu-fusha',
    title: '条件は、向こうが外している',
    core:
      '「見捨てられないように、いい子でいなさい」という条件つきの話に聞こえる。けれども条件は、こちらではなく向こうが外している。出来不出来は問われていない。',
    openings: ['評価される場面', '選ばれなかった知らせ', '条件つきの優しさ'],
    openingIds: ['happyo-shizuka', 'iine-hitotsu'],
    step: '「がんばったから認められる」という順番を、一度外して過ごす。',
    source: '『観無量寿経』「光明遍照十方世界 念仏衆生摂取不捨」',
  },
  {
    id: 'sesshu-2',
    ofKind: 'concept',
    ofId: 'sesshu-fusha',
    title: '逃げる者を追いかけて',
    core:
      'おさめ取るとは、じっと待っていることではない。逃げていく者を追いかけてまで、という一方的なはたらきとして説かれる。',
    openings: ['連絡を返せずにいる相手', '顔を合わせづらくなった人'],
    openingIds: ['kidoku'],
    step: '避けていた連絡を、一つだけ返す。',
  },
  {
    id: 'sesshu-3',
    ofKind: 'concept',
    ofId: 'sesshu-fusha',
    title: '数のうちに入れていない一人',
    core:
      '自分では、その他大勢の一人だと思っている。ところが数に入れていないこちらの側が、向こうからは一人として見られている。',
    openings: ['大勢の中の自分', '名前を覚えられていないと思ったとき'],
    openingIds: ['dousoukai', 'manin-densha'],
    step: '今日、名前で呼んでいない人を一人、名前で呼ぶ。',
  },
  {
    id: 'sesshu-4',
    ofKind: 'concept',
    ofId: 'sesshu-fusha',
    title: '消せない写真',
    core:
      '容量がいっぱいになって消そうとすると、どれも消せない。どれかを捨てるという作業が、そもそもできない。捨てないとは、そういう形をしている。',
    openings: ['写真フォルダの容量', 'たんすに残った服', '捨てられない手紙'],
    openingIds: ['youryou', 'nokosareta-fuku'],
    step: '捨てられずにいるものを一つ、捨てないまま置いておく。',
  },

  // ───────── 諸行無常 ─────────
  {
    id: 'mujou-1',
    ofKind: 'concept',
    ofId: 'shogyo-mujo',
    title: 'なぜ、そのままでいてくれないのか',
    core:
      '無常は「はかない」という情緒の言葉として使われる。けれども言っているのは、形あるものはその形のままでは続かない、という事実のほう。嘆きではなく、見立て。',
    openings: ['久しぶりに会った人の変わりよう', '取り壊される建物', '閉店の貼り紙'],
    openingIds: ['dousoukai', 'oshi'],
    step: '変わってしまったものを一つ、惜しまずに見てみる。',
  },
  {
    id: 'mujou-2',
    ofKind: 'concept',
    ofId: 'shogyo-mujo',
    title: '朝には紅顔ありて',
    core:
      '白骨の御文は、老少不定——順番が決まっていないと言う。年の順ではない、というところが、この一通のいちばん厳しいところ。',
    openings: ['同い年の訃報', '若い方の葬儀のあと'],
    openingIds: ['byoushitsu', 'nokosareta-fuku'],
    step: '順番を当てにしていた自分に、一度気づいておく。',
    source: '蓮如上人『御文』五帖目第十六通（白骨の御文）',
    caution: '通夜・葬儀の場では、脅しに聞こえない置き方にする。',
  },
  {
    id: 'mujou-3',
    ofKind: 'concept',
    ofId: 'shogyo-mujo',
    title: '同じ景色が、毎日少し違う',
    core:
      '病室の窓から見える景色は、たいてい同じ。それでも毎日少し違う。変わらないと思っているものが、実は毎日入れ替わっている。',
    openings: ['病室の窓', '毎朝の通勤路', '同じ席から見る庭'],
    openingIds: ['byoushitsu'],
    step: '毎日見ている景色の、今日だけ違うところを一つ探す。',
  },
  {
    id: 'mujou-4',
    ofKind: 'concept',
    ofId: 'shogyo-mujo',
    title: '変わるから、やり直せる',
    core:
      '続かないというのは、悪いことばかりではない。いまの苦しさも、その形のままでは続かない。無常は、行き止まりを解く言葉でもある。',
    openings: ['どん底だったあの時期', '抜けられないと思っていたあの時期'],
    openingIds: ['kakeibo'],
    step: '去年いちばん苦しかったことを、いま思い出せるか試してみる。',
  },

  // ───────── 聞法 ─────────
  {
    id: 'monbou-1',
    ofKind: 'concept',
    ofId: 'monbou',
    title: 'いい話だった、で終わる日',
    core:
      '聞くとは、情報を集めることではなく、自分が問われること。「いい話だった」で終わる日と、痛いところを突かれる日とがある。',
    openings: ['講演のあとの帰り道', '本を読み終えた翌日'],
    openingIds: ['happyo-shizuka'],
    step: '今日聞いた話のうち、都合の悪かった一言を思い出す。',
  },
  {
    id: 'monbou-2',
    ofKind: 'concept',
    ofId: 'monbou',
    title: '調べても出てこない',
    core:
      '調べれば何でも出てくる時代に、いちばん知りたいことだけ出てこない。検索で片づく問いと、聞くしかない問いとがある。',
    openings: ['検索しても答えが出ない', 'AIに相談する'],
    openingIds: ['kensaku', 'ai-soudan'],
    step: '答えの出ない問いを一つ、そのまま持って帰る。',
  },
  {
    id: 'monbou-3',
    ofKind: 'concept',
    ofId: 'monbou',
    title: '同じ話を何度も',
    core:
      '子どもは同じ絵本を、同じところで同じように笑う。同じ話を何度も聞ける、というのは力のうち。聞法もそういう形をしている。',
    openings: ['同じ絵本を十回', '何度も聞いた昔話'],
    openingIds: ['ehon'],
    step: '一度聞いた話を、もう一度聞いてみる。',
  },
  {
    id: 'monbou-4',
    ofKind: 'concept',
    ofId: 'monbou',
    title: '説く側に立つと聞こえない',
    core:
      '説く側に立ったとたん、その一句は聞こえなくなる。語り手も、聞く側の一人としてそこに座っている。',
    openings: ['人に教えている自分', '注意したあとの後味'],
    openingIds: ['oya-sumaho', 'chuui'],
    step: '今日、教える口調になった場面を一つ思い出す。',
  },

  // ───────── お浄土 ─────────
  {
    id: 'ojodo-1',
    ofKind: 'concept',
    ofId: 'ojodo',
    title: '天国ではなく、浄土',
    core:
      '天国と浄土は、混ぜて使われている。浄土は、行った人がそこで終わる場所ではなく、はたらきに出る場所として説かれる。',
    openings: ['「天国のおじいちゃん」と子どもが言う', '空に向かって手を振る'],
    step: '「天国」と言いかけたとき、一度だけ言い換えてみる。',
    caution: '子どもや遺族の言い方を頭から否定しない。由来として伝える形にする。',
  },
  {
    id: 'ojodo-2',
    ofKind: 'concept',
    ofId: 'ojodo',
    title: '会いに行く場所ではない',
    core:
      'また会える、という受け取りは自然だ。ただ真宗は、そこから還ってはたらく側の話をする。会いに行く場所ではなく、はたらきが出てくる方角。',
    openings: ['遺影の前', '命日の朝', 'たんすに残った服'],
    openingIds: ['butsudan', 'nokosareta-fuku'],
    step: '亡き方から受け取っているものを、一つ数える。',
  },
  {
    id: 'ojodo-3',
    ofKind: 'concept',
    ofId: 'ojodo',
    title: '距離の話ではない',
    core:
      '十万億土の彼方と説かれる。ところがその遠さは、道のりの遠さではなく、こちらの手が届かないという意味で聞く。',
    openings: ['遠方の墓参り', '行けなかった葬儀'],
    step: '行けなかった場所を一つ思い出して、そのままにしておく。',
    caution: '距離や場所の実在をめぐる議論には踏み込まない。',
  },

  // ───────── 平生業成 ─────────
  {
    id: 'heizei-1',
    ofKind: 'concept',
    ofId: 'heizei-gojou',
    title: '死に際の話ではない',
    core:
      '仏教は死に際の心構えの話だと思われている。真宗は臨終の善し悪しを問わない。いまこの場で定まっていると聞くから、死に方で評価されずに済む。',
    openings: ['「最期は自宅で」という話', '終活のセミナー', 'エンディングノート'],
    openingIds: ['saikensa', 'teinen'],
    step: '「立派に死ぬ」ではなく「今日を普通に生きる」に目標を戻す。',
  },
  {
    id: 'heizei-2',
    ofKind: 'concept',
    ofId: 'heizei-gojou',
    title: 'いい顔で死ねるか',
    core:
      '最期にいい顔で死ねるかどうかを、みんな気にしている。そこを問わない、と言い切るところに、この言葉の働きがある。',
    openings: ['「安らかなお顔で」と言われる場面', '誰かの最期の話'],
    openingIds: ['byoushitsu'],
    step: '最期の場面を思い描くのを、今日はやめておく。',
    caution: '通夜・葬儀の場では、ご遺族の言葉を否定しない形で。',
  },
  {
    id: 'heizei-3',
    ofKind: 'concept',
    ofId: 'heizei-gojou',
    title: 'ふだんの暮らしの中で',
    core:
      '平生とは、特別な日ではない、ふだんのこと。台所でも、通勤の途中でも、その場で定まると聞く。',
    openings: ['洗い物をしている手', '通勤の電車', '洗濯物をたたむ時間'],
    openingIds: ['sentaku', 'manin-densha'],
    step: '今日いちばん何でもなかった時間を、一つ思い出す。',
  },
  // ───────── 悪人正機 ─────────
  {
    id: 'akunin-1',
    ofKind: 'concept',
    ofId: 'akunin-shoki',
    title: '善人でさえ、というところから',
    core:
      '「善人なをもて往生をとぐ、いはんや悪人をや」。順番が世間と逆になっている。ここでいう悪人とは、悪事を働く人ではなく、自分の力で善をこしらえられない者のこと。',
    openings: ['善い行いを数えてしまう自分', '寄付をしたあとの気持ち'],
    openingIds: ['hanko'],
    step: '今日した善いことを、誰にも言わずに置いておく。',
    source: '『歎異抄』第三条',
    caution: '悪を勧める話ではない。造悪無碍（本願ぼこり）への注意は『歎異抄』第十三条に。',
  },
  {
    id: 'akunin-2',
    ofKind: 'concept',
    ofId: 'akunin-shoki',
    title: '自分を善い人だと思えない者',
    core:
      '自分を善い人だと思えない者は、後回しにされるのか。逆だと言う。手持ちの善を当てにできなくなったところが、本願の目当てになっている。',
    openings: ['人に誇れることがないと思うとき', '履歴書の空白'],
    openingIds: ['kagami', 'hikidashi-shoujou'],
    step: '誇れないところを一つ、そのままにしておく。',
    source: '『歎異抄』第三条',
  },
  {
    id: 'akunin-3',
    ofKind: 'concept',
    ofId: 'akunin-shoki',
    title: '縁次第で、どうにでもなる',
    core:
      '「さるべき業縁のもよほせば、いかなるふるまひもすべし」。しないでいられるのは、しないで済む縁にいるだけ。善悪を、その人の中身の話にしない。',
    openings: ['ニュースの事件に驚くとき', '「信じられない」と言ってしまった場面'],
    openingIds: ['review', 'manin-densha'],
    step: 'ひどい話を聞いたとき、「自分なら」と言いかけて一度止める。',
    source: '『歎異抄』第十三条',
  },
  {
    id: 'akunin-4',
    ofKind: 'concept',
    ofId: 'akunin-shoki',
    title: '善人という居場所',
    core:
      '善人でいたい、という気持ちそのものは消えない。消えないまま、その足場が当てにならないと知らされる。消すのではなく、当てにしないという形。',
    openings: ['褒められて落ち着かないとき', '良い人だと思われたい場面'],
    openingIds: ['iine-hitotsu', 'happyo-shizuka'],
    step: '良く思われたくて言いかけた一言を、今日ひとつ飲み込む。',
  },

  // ───────── 信心 ─────────
  {
    id: 'shinjin-1',
    ofKind: 'concept',
    ofId: 'shinjin',
    title: '信じる気持ちが湧かない',
    core:
      '信心とは、私が起こす心ではなく、如来から賜る心だと聞く。湧かないから資格がない、という話にはならない。起こすものではないから。',
    openings: ['お参りしても何も感じない日', '手を合わせても上の空'],
    openingIds: ['butsudan'],
    step: '感じないまま、いつもどおり手を合わせてみる。',
    source: '「如来よりたまはりたる信心」（『歎異抄』後序）',
  },
  {
    id: 'shinjin-2',
    ofKind: 'concept',
    ofId: 'shinjin',
    title: '強い信心、弱い信心',
    core:
      '信心に強弱があるように思ってしまう。けれども賜るものなら、こちらの濃さの話ではない。量る物差しが、そもそも違う。',
    openings: ['信仰の篤い人と自分を比べる', '熱心な方の話を聞いたあと'],
    openingIds: ['dousoukai', 'sns-ie'],
    step: '人の信心と自分のを、比べかけたところでやめる。',
  },
  {
    id: 'shinjin-3',
    ofKind: 'concept',
    ofId: 'shinjin',
    title: '疑いが消えないまま',
    core:
      '疑いが消えてから信じるのだと思っている。けれども疑う私のほうが先に引き受けられている、と聞く。順番が逆になっている。',
    openings: ['半信半疑のままお参りする', '納得できていない自分'],
    openingIds: ['kensaku', 'ai-soudan'],
    step: '納得できていないことを、納得しないまま持っておく。',
  },

  // ───────── 現生正定聚 ─────────
  {
    id: 'genshou-1',
    ofKind: 'concept',
    ofId: 'genshou-shoujouju',
    title: '死んでからではない',
    core:
      '浄土の話は死んでからの話だと思われている。真宗は、往生が定まるのを今と見る。先送りの話ではなく、今日をどう受け取るかの話になる。',
    openings: ['終活の本', '「そのうち」と言っている用事'],
    openingIds: ['teinen', 'shimekiri'],
    step: '「そのうち」と言っている用事を一つ、今日の分だけ進める。',
    source: '『教行信証』信巻',
  },
  {
    id: 'genshou-2',
    ofKind: 'concept',
    ofId: 'genshou-shoujouju',
    title: '決まっているから、動ける',
    core:
      '先が決まっていないと落ち着かない。定まっていると聞くのは、縛られることではなく、そこから手が動きはじめるということ。',
    openings: ['進路が決まった日', '合否が出たあと'],
    openingIds: ['nyugaku', 'hatsukyuryo'],
    step: '決まっていないことを一つ、決まったことにして今日を過ごす。',
  },
  {
    id: 'genshou-3',
    ofKind: 'concept',
    ofId: 'genshou-shoujouju',
    title: '仲間のうちに入っている',
    core:
      '正定聚とは、正しく定まった仲間のこと。ひとりで決まるのではなく、その数のうちに入れられている、という言い方をする。',
    openings: ['名簿に自分の名前を見つけたとき', '知らない人ばかりの集まり'],
    openingIds: ['dousoukai', 'hikkoshi-aisatsu'],
    step: '自分が入っている輪を一つ、数えてみる。',
  },

  // ───────── 還相回向 ─────────
  {
    id: 'gensou-1',
    ofKind: 'concept',
    ofId: 'gensou-ekou',
    title: '亡き人は、何もしてくれないのか',
    core:
      '往って終わり、ではないと説く。浄土に生まれた人が、こちらへ還ってはたらく——往相と還相、二つの向きで受け取る。',
    openings: ['亡き人の口ぐせを思い出す', '同じことを自分が言っている'],
    openingIds: ['nokosareta-fuku', 'butsudan'],
    step: '亡き方から受け取っているものを、一つ言葉にしてみる。',
    source: '『教行信証』証巻（二種回向）',
  },
  {
    id: 'gensou-2',
    ofKind: 'concept',
    ofId: 'gensou-ekou',
    title: '見守っている、との違い',
    core:
      '「見守ってくれている」という言い方は、遺族の実感として自然だ。還相は、そこからもう一歩、こちらへはたらきに出ると言う。',
    openings: ['「空から見てるよ」と言う場面', '遺影に話しかける'],
    openingIds: ['butsudan'],
    step: '亡き方が自分にさせていることを、一つ探す。',
    caution: 'ご遺族の言い方を頭から直さない。受け取りの一つとして添える。',
  },
  {
    id: 'gensou-3',
    ofKind: 'concept',
    ofId: 'gensou-ekou',
    title: 'こちらが差し向けたのではない',
    core:
      '回向とは、こちらが功徳を差し向けることだと思われている。真宗では向きが逆で、如来から差し向けられたものを受け取る。',
    openings: ['法事のお供え', '「供養してあげる」という言い方'],
    openingIds: ['butsudan'],
    step: '「してあげる」と言いかけたら、一度だけ言い換えてみる。',
    caution: '大谷派では追善供養の語を使わない。',
  },

  // ───────── 自然法爾 ─────────
  {
    id: 'jinen-1',
    ofKind: 'concept',
    ofId: 'jinen-houni',
    title: 'はからいを離れる',
    core:
      '「自然といふは、自はおのづからといふ、行者のはからひにあらず」。こちらの計算が外れたところで、そのようにあらしめられている、と聞く。',
    openings: ['段取りが全部崩れた日', '計画どおりにいかなかった旅'],
    openingIds: ['tenki-app', 'densha'],
    step: '今日ひとつ、決めずに成り行きにまかせてみる。',
    source: '『末灯鈔』自然法爾章',
  },
  {
    id: 'jinen-2',
    ofKind: 'concept',
    ofId: 'jinen-houni',
    title: '力を抜く、ではない',
    core:
      '何もしないことでも、投げやりになることでもない。やるだけやったうえで、その勘定を手放すほうを言っている。',
    openings: ['出し切ったあとの発表', '提出したあとの時間'],
    openingIds: ['happyo-shizuka', 'shimekiri'],
    step: '終えたことの結果を、今日は数えないでおく。',
  },
  {
    id: 'jinen-3',
    ofKind: 'concept',
    ofId: 'jinen-houni',
    title: '晩年に書かれた一通',
    core:
      '自然法爾章は、親鸞聖人の最晩年の手紙。長く考え抜いた人が、最後にこの一語に落ち着いた——その順番のほうに重みがある。',
    openings: ['長く迷った末の結論', '年を重ねて言い方が変わった人'],
    openingIds: ['teinen', 'menkyo-hennou'],
    step: '若い頃の自分なら言わなかったことを、一つ思い出す。',
    source: '『末灯鈔』自然法爾章',
  },

  // ───────── 二種深信 ─────────
  {
    id: 'nishu-1',
    ofKind: 'concept',
    ofId: 'nishu-jinshin',
    title: '同時に起こる、ということ',
    core:
      '救われない自分だと知らされることと、必ず救うと聞こえることは、順番に起こるのではない。一つの出来事の表と裏として起こると説かれる。',
    openings: ['叱られて、同時に守られていたと分かる', '指摘されて助かった場面'],
    openingIds: ['chuui', 'kaigi-ato'],
    step: '痛かった一言を、もう一度だけ思い出してみる。',
    source: '善導大師『観経疏』散善義（機の深信・法の深信）',
  },
  {
    id: 'nishu-2',
    ofKind: 'concept',
    ofId: 'nishu-jinshin',
    title: 'だめだと認めたら終わり、ではない',
    core:
      '自分はだめだと認めることを、私たちは敗北だと思う。ここでは、そこが始まりとして置かれている。認めた先に、まだ道がある。',
    openings: ['できないと言えなかった場面', '助けを求められなかった日'],
    openingIds: ['ai-soudan', 'kakeibo'],
    step: '「できません」と今日ひとつ言ってみる。',
  },
  {
    id: 'nishu-3',
    ofKind: 'concept',
    ofId: 'nishu-jinshin',
    title: '自分の見込みは上がらない',
    core:
      '信じると、自分の見込みが上がるように思ってしまう。そうではなく、見込みのなさがはっきりするほうが先に来る。',
    openings: ['自己啓発の本を閉じたあと', '前向きになれない日'],
    openingIds: ['kagami', 'shiroi-calendar'],
    step: '前向きにならなくていい時間を、今日十分だけとる。',
  },

  // ───────── 非僧非俗 ─────────
  {
    id: 'hisou-1',
    ofKind: 'concept',
    ofId: 'hisou-hizoku',
    title: 'どちらでもない、という立ち方',
    core:
      '「すでに僧にあらず俗にあらず」。流罪で僧の身分を奪われたところから名のられた。どっちつかずではなく、どちらにも寄りかからない立ち方。',
    openings: ['肩書きが変わった時期', 'どちらの側にも入れない場面'],
    openingIds: ['teinen', 'soubetsu'],
    step: '肩書きを外した自己紹介を、一度だけ書いてみる。',
    source: '『教行信証』後序',
  },
  {
    id: 'hisou-2',
    ofKind: 'concept',
    ofId: 'hisou-hizoku',
    title: '愚禿と名のる',
    core:
      '名を奪われたあと、みずから「愚禿」と名のられた。与えられた名ではなく、自分で引き受けた名のほう。',
    openings: ['役職がなくなった日', '名刺を配らなくなってから'],
    openingIds: ['teinen'],
    step: '自分を何と呼ぶか、今日ひとつ決めてみる。',
    source: '『教行信証』後序',
  },
  {
    id: 'hisou-3',
    ofKind: 'concept',
    ofId: 'hisou-hizoku',
    title: '在家のまま',
    core:
      '妻帯し、肉を食べ、子を育てながら、その暮らしのまま仏道の側に立った。特別な場所へ移らずに、というところが要になっている。',
    openings: ['家事と仕事に追われる毎日', '静かな時間が取れない暮らし'],
    openingIds: ['sentaku', 'kodomo-shippai'],
    step: '今日いちばん雑事に見えた時間を、一つ思い出す。',
  },
  // ───────── 弟子一人ももたず ─────────
  {
    id: 'deshi-1',
    ofKind: 'concept',
    ofId: 'deshi-ichinin',
    title: 'この人は、私のものなのか',
    core:
      '「親鸞は弟子一人ももたずさふらふ」。教えたのは自分ではない、という一点。人を自分のものだと思った瞬間に、間違えると言い切る。',
    openings: ['育てたつもりの後輩', '「うちの子」と言うとき'],
    openingIds: ['oya-sumaho', 'ehon'],
    step: '「私が育てた」と言いかけたら、一度止める。',
    source: '『歎異抄』第六条',
  },
  {
    id: 'deshi-2',
    ofKind: 'concept',
    ofId: 'deshi-ichinin',
    title: '連れてきたのは、誰か',
    core:
      'こちらの働きかけで人が動いたように見える。けれども動かしたのはこちらではない、と見る。手柄を自分に戻さない形。',
    openings: ['誘って来てくれた人', '勧めた本を読んでくれた相手'],
    openingIds: ['tegami', 'tomodachi-shoukai'],
    step: '自分の手柄にしていたことを、一つ返しておく。',
    source: '『歎異抄』第六条',
  },
  {
    id: 'deshi-3',
    ofKind: 'concept',
    ofId: 'deshi-ichinin',
    title: '離れていくとき',
    core:
      '自分のものだと思っていると、離れていくときに腹が立つ。はじめから預かっていただけなら、見送れる。',
    openings: ['子どもが家を出る日', '辞めていく人を見送る'],
    openingIds: ['nyugaku', 'soubetsu'],
    step: '離れていった人のことを、責めずに一度思い出す。',
  },

  // ───────── 親鸞一人がため ─────────
  {
    id: 'ichinin-1',
    ofKind: 'concept',
    ofId: 'ichinin-no-tame',
    title: 'その他大勢のつもりでいる',
    core:
      '「ひとへに親鸞一人がためなりけり」。大勢のうちの一人だと思っているこちらを、向こうは一人として数えていた、という受け取り。',
    openings: ['大勢の中の自分', '名前を覚えられていないと思ったとき'],
    openingIds: ['manin-densha', 'dousoukai'],
    step: '今日、自分の名前を呼ばれた場面を一つ思い出す。',
    source: '『歎異抄』後序',
  },
  {
    id: 'ichinin-2',
    ofKind: 'concept',
    ofId: 'ichinin-no-tame',
    title: '独り占めではない',
    core:
      '自分一人のため、と聞くと独占のように響く。けれども誰が聞いても「私一人のため」になる——そこがこの言葉の作りになっている。',
    openings: ['同じ歌を自分のことだと思う', '手紙の宛名が自分だったとき'],
    openingIds: ['tegami'],
    step: '自分宛てに書かれたものを、一つ読み返す。',
    source: '『歎異抄』後序',
  },
  {
    id: 'ichinin-3',
    ofKind: 'concept',
    ofId: 'ichinin-no-tame',
    title: '五劫のあいだ考えられた相手',
    core:
      '長く考え抜かれた願の、宛先がこちらだったという話。たまたま当たったのではない、という順番のほうに重みがある。',
    openings: ['偶然に見えた出会い', '後から意味が分かった一件'],
    openingIds: ['otoshimono'],
    step: '偶然だと思っていたことを一つ、数え直してみる。',
  },

  // ───────── 良時吉日をえらばしめ ─────────
  {
    id: 'ryouji-1',
    ofKind: 'concept',
    ofId: 'ryouji-kichijitsu',
    title: '日柄を気にする心のほう',
    core:
      '「かなしきかなや道俗の 良時吉日えらばしめ」。日取りや方角そのものより、それに振り回される心のほうを歎かれている。',
    openings: ['仏滅を避けた日取り', '大安の引っ越し', '方位を見る'],
    step: '日柄で決めかけている用事を、都合のよい日に決め直す。',
    source: '『正像末和讃』愚禿悲歎述懐',
    caution: '地域や家の慣習を頭から否定しない。由来として伝える形にする。',
  },
  {
    id: 'ryouji-2',
    ofKind: 'concept',
    ofId: 'ryouji-kichijitsu',
    title: '門徒もの知らず',
    core:
      '作法を知らない人たちだ、と言われてきた。知らないのではなく、俗信を用いないという選択のほうだった。',
    openings: ['「それはしないの？」と言われる場面', '他家の作法との違い'],
    step: '「知らない」と言われた一件を、一度説明してみる。',
    caution: '他宗・他家のやり方を下に置く言い方にしない。',
  },
  {
    id: 'ryouji-3',
    ofKind: 'concept',
    ofId: 'ryouji-kichijitsu',
    title: 'いのちを何に預けるか',
    core:
      '占いや方角に預けるのは、決めきれない不安を外へ置くこと。どこへ預けるかという一点が問われている。',
    openings: ['おみくじを何度も引く', '占いのアプリ', '厄年の話'],
    openingIds: ['kensaku', 'gacha'],
    step: '今日、何かを占いで決めようとしたら、一度手を止める。',
  },

  // ───────── 法名 ─────────
  {
    id: 'houmyou-1',
    ofKind: 'concept',
    ofId: 'houmyou',
    title: '死んでからもらうものではない',
    core:
      '戒名ではなく法名。しかも生きているうちに受けられる。帰敬式でいただくもので、亡くなってから付けるものではない。',
    openings: ['「戒名はいくら」という話', '終活の相談'],
    openingIds: ['teinen'],
    step: '自分の法名について、一度だけ考えてみる。',
    caution: '大谷派では戒名と言わない。帰敬式（おかみそり）の案内は自坊の実際に合わせて。',
  },
  {
    id: 'houmyou-2',
    ofKind: 'concept',
    ofId: 'houmyou',
    title: '釋の一字',
    core:
      '法名には釋の一字が付く。家の名でも、生前の肩書きでもない名で呼ばれる、というところに意味がある。',
    openings: ['名刺の肩書き', '「◯◯さんの奥さん」と呼ばれる'],
    openingIds: ['teinen', 'dousoukai'],
    step: '肩書きなしで呼ばれたのは、いつが最後か思い出す。',
  },
  {
    id: 'houmyou-3',
    ofKind: 'concept',
    ofId: 'houmyou',
    title: '値段の話になってしまう',
    core:
      '位の高い名、という話になりやすい。もともと位を買うものではない。そこを先に外しておくと、話が通る。',
    openings: ['葬儀社の見積もり', '親戚に言われた一言'],
    step: '値段で決めかけていることを、一つ見つける。',
    caution: '他寺の慣行を批判する形にしない。',
  },

  // ───────── お内仏 ─────────
  {
    id: 'onaibutsu-1',
    ofKind: 'concept',
    ofId: 'onaibutsu',
    title: '亡くなった人の家ではない',
    core:
      '仏壇は亡き人の居場所だと思われている。お内仏の真ん中は阿弥陀如来で、亡き方はそこへ参る手がかり。拝む先そのものではない。',
    openings: ['実家の仏壇', '「おじいちゃんに挨拶して」と言う'],
    openingIds: ['butsudan'],
    step: '手を合わせるとき、真ん中を一度だけ見る。',
    caution: '大谷派では位牌ではなく法名軸・過去帳。自坊の実際に合わせて。',
  },
  {
    id: 'onaibutsu-2',
    ofKind: 'concept',
    ofId: 'onaibutsu',
    title: '花だけが、いつも新しい',
    core:
      '実家に帰ると、仏壇の花だけが新しい。誰かが替えているからだ。家の中に、毎日手が入っている場所が一つある。',
    openings: ['実家の仏壇', '掃除されている場所'],
    openingIds: ['butsudan'],
    step: '誰が替えているか、一度きいてみる。',
  },
  {
    id: 'onaibutsu-3',
    ofKind: 'concept',
    ofId: 'onaibutsu',
    title: '置き場所がない、という相談',
    core:
      '住まいが変わって、置けなくなったという話が増えた。形を小さくしてでも、家の中に真ん中を一つ置く——そこを一緒に考える。',
    openings: ['引っ越しのダンボール', 'マンションの間取り'],
    openingIds: ['danbooru', 'hikkoshi-aisatsu'],
    step: '家の中で、真ん中にしている場所を一つ探す。',
    caution: '自坊の対応や地域の実際に合わせて話すこと。',
  },

  // ───────── 往生 ─────────
  {
    id: 'oujou-1',
    ofKind: 'concept',
    ofId: 'oujou',
    title: '「往生した」の使われ方',
    core:
      '困り果てたときに「往生した」と言う。もとは浄土に生まれること。行き詰まりの言葉として使われるようになったところが、入口になる。',
    openings: ['渋滞にはまる', '電車が止まる', '書類が通らない'],
    openingIds: ['densha', 'kaiyaku'],
    step: '「往生した」と言いかけたら、もとの意味を一度思い出す。',
  },
  {
    id: 'oujou-2',
    ofKind: 'concept',
    ofId: 'oujou',
    title: '往くと、生まれる',
    core:
      '往生の二字は、往くことと生まれること。終わりではなく、そこから始まる向きの言葉として置かれている。',
    openings: ['引っ越しの朝', '転勤の辞令', '入学式'],
    openingIds: ['danbooru', 'nyugaku'],
    step: '終わりだと思っていることを、一つ始まりとして書き直す。',
  },
  {
    id: 'oujou-3',
    ofKind: 'concept',
    ofId: 'oujou',
    title: '大往生という言い方',
    core:
      '長く生きて安らかに、という意味で使われる。死に方の善し悪しを測る言葉になってしまっている。真宗はそこを問わない。',
    openings: ['「大往生でしたね」と言われる場面', '通夜の席の会話'],
    openingIds: ['byoushitsu'],
    step: '死に方で人を測っていた言い方を、一つ見つける。',
    caution: 'ご遺族の言葉を頭から直さない。通夜・葬儀の場では特に。',
  },

  // ───────── 無碍の一道 ─────────
  {
    id: 'muge-1',
    ofKind: 'concept',
    ofId: 'muge-no-ichido',
    title: '障りが消えるのではない',
    core:
      '「念仏者は無碍の一道なり」。邪魔なものが無くなる話ではない。障りを抱えたまま歩ける道がある、という言い方をしている。',
    openings: ['治らない持病', 'いなくならない苦手な人'],
    openingIds: ['saikensa', 'namae-mite'],
    step: '「これさえなければ」と思っているものを、消さずに一日過ごす。',
    source: '『歎異抄』第七条',
  },
  {
    id: 'muge-2',
    ofKind: 'concept',
    ofId: 'muge-no-ichido',
    title: '行き止まりではなくなる',
    core:
      '状況は何も変わらないのに、行き止まりではなくなる。そういう変わり方がある、と聞く。',
    openings: ['八方ふさがりの時期', '出口が見えない仕事'],
    openingIds: ['kakeibo', 'shimekiri'],
    step: '行き止まりだと思っている一件の、脇道を一つ探す。',
  },
  {
    id: 'muge-3',
    ofKind: 'concept',
    ofId: 'muge-no-ichido',
    title: '一道、という言い方',
    core:
      'いくつもある中から選んだ道ではなく、一つの道だと言う。選択肢が多いほど苦しくなる時代に、逆のことを言っている。',
    openings: ['選択肢が多すぎて決められない', 'メニューが多い店'],
    openingIds: ['konbini', 'gyouretsu'],
    step: '今日ひとつ、選ばずに決める。',
  },

  // ───────── 同朋 ─────────
  {
    id: 'doubou-1',
    ofKind: 'concept',
    ofId: 'doubou',
    title: '教える側と教わる側に分けない',
    core:
      '同じ方向を向いた仲間、という言い方。上下ではなく横並び。相談される側も、実は同じことで困っている。',
    openings: ['相談を受けたとき', '先輩として話す場面'],
    openingIds: ['oya-sumaho', 'chuui'],
    step: '今日、教える口調になったところを一つ思い出す。',
  },
  {
    id: 'doubou-2',
    ofKind: 'concept',
    ofId: 'doubou',
    title: '御同朋御同行',
    core:
      '蓮如上人は門徒を「御同朋御同行」と呼ばれた。教える側が上に立たない、という一点が、この呼び方に残っている。集まりの席で、誰が誰を下に置いているか。',
    openings: ['集まりの席順', '役職の上下'],
    openingIds: ['dousoukai', 'soubetsu'],
    step: '上下で見ていた相手を、一人だけ横に置き直す。',
    caution: '出典の文言は自坊の勤行本・聖典で確かめて。',
  },
  {
    id: 'doubou-3',
    ofKind: 'concept',
    ofId: 'doubou',
    title: '隣に誰が住んでいるか',
    core:
      '困らないから知らないままで、困ってからでは聞けない。同じ方向を向く前に、隣にいることすら知らない時代になった。',
    openings: ['隣に誰が住んでいるか知らない', '町内会の名簿'],
    openingIds: ['hikkoshi-aisatsu', 'muon'],
    step: '今日、名前を知らない人に一言だけ声をかける。',
  },

  // ───────── 恩徳讃 ─────────
  {
    id: 'ondoku-1',
    ofKind: 'concept',
    ofId: 'ondokusan',
    title: '返しきれないと知った者の歌',
    core:
      '「身を粉にしても報ずべし」と聞くと、返済の話に響く。けれども返せる相手に返す歌ではない。返しきれないと知った者の、行き場のない気持ちがそのまま歌になっている。',
    openings: ['親に何も返せないまま', '世話になった人が先に亡くなった'],
    openingIds: ['nokosareta-fuku', 'soubetsu'],
    step: '返せなかった相手の名を、一人だけ思い出す。',
    source: '『正像末和讃』（恩徳讃）',
  },
  {
    id: 'ondoku-2',
    ofKind: 'concept',
    ofId: 'ondokusan',
    title: '最後に歌う理由',
    core:
      '集まりの終わりに歌う。話を聞いたあとで、受けていたと気づいた者が声を出す——その順番になっている。',
    openings: ['集まりの終わり', '校歌や社歌を歌う場面'],
    openingIds: ['dousoukai', 'soubetsu'],
    step: '次に歌うとき、歌詞を一行だけ目で追ってみる。',
  },
  {
    id: 'ondoku-3',
    ofKind: 'concept',
    ofId: 'ondokusan',
    title: '師主知識の恩徳も',
    core:
      '如来だけでなく、師や先達の恩も並べて置かれている。顔の見える人の名前が、そこに入っている。',
    openings: ['恩師の訃報', '名前を思い出せない先生'],
    openingIds: ['soubetsu', 'dousoukai'],
    step: '教わった人の名を、三人書き出してみる。',
  },

  // ───────── 他力本願（誤用） ─────────
  {
    id: 'tarikihongan-1',
    ofKind: 'concept',
    ofId: 'tariki-hongan',
    title: '広告で見かける',
    core:
      '「他力本願ではいけません」という言い方が、広告や社内報にまで出てくる。取り違えがここまで広まったこと自体が、話の入口になる。',
    openings: ['社内のスローガン', 'ニュースのコメント'],
    openingIds: ['kaigi-ato'],
    step: '今日「他力本願」と聞いたら、心の中で一度だけ直す。',
    source: '『教行信証』行巻「他力といふは如来の本願力なり」',
  },
  {
    id: 'tarikihongan-2',
    ofKind: 'concept',
    ofId: 'tariki-hongan',
    title: '人をあてにするのは悪いことか',
    core:
      '誤用を直すだけで終わると、言葉の勉強になる。そこから、人をあてにするのはそんなに悪いことか、という問いのほうへ渡すと話になる。',
    openings: ['人に頼めなかった仕事', '「自分でやります」と言った場面'],
    openingIds: ['ai-soudan', 'kakeibo'],
    step: '今日ひとつ、人に頼んでみる。',
  },
  {
    id: 'tarikihongan-3',
    ofKind: 'concept',
    ofId: 'tariki-hongan',
    title: '誤用を責めない',
    core:
      '間違って使っている人を正すと、そこで話が終わる。使ってしまう気持ちのほうを先に認めると、聞いてもらえる。',
    openings: ['言い間違いを直された記憶', '人前で訂正されたとき'],
    openingIds: ['chuui'],
    step: '直したくなった一言を、今日ひとつ飲み込む。',
  },
]

export const TAKE_BY_ID: Record<string, Take> = Object.fromEntries(TAKES.map((t) => [t.id, t]))

/** その言葉・一節・人物の案を引く */
export function takesFor(kind: Take['ofKind'], id: string): Take[] {
  return TAKES.filter((t) => t.ofKind === kind && t.ofId === id)
}
