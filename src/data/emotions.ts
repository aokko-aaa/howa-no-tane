import type { Emotion } from './types'

// 一般の人が自分の言葉で選べる粒度にする（仏教語では並べない）。
export const EMOTIONS: Emotion[] = [
  { id: 'iraira', label: 'イライラする', group: 'くるしみ', plain: '腹が立つ、当たってしまう', keywords: ['イライラ', 'いらいら', '腹が立', '怒', 'ムカ', '当たって', '不機嫌'], question: 'なんで？' },
  { id: 'fuan', label: '不安でたまらない', group: 'くるしみ', plain: '先が見えなくて落ち着かない', keywords: ['不安', 'こわい', '怖い', '心配', '眠れない', '落ち着か'], question: '何が？' },
  { id: 'aseri', label: '焦っている', group: 'ざわつき', plain: '間に合わない、置いていかれる', keywords: ['焦', 'あせ', '間に合わ', '締切', '遅れ', '急い'], question: 'なんで？' },
  { id: 'ochikomi', label: '落ち込んでいる', group: 'くるしみ', plain: '自信がない、うまくいかない', keywords: ['落ち込', '凹', 'へこ', '自信', '失敗', 'ダメ'], question: 'なんで？' },
  { id: 'kodoku', label: 'さびしい・ひとり', group: 'くるしみ', plain: '誰にもわかってもらえない', keywords: ['さびし', '寂し', '孤独', 'ひとり', '一人', '独り'], question: 'どんなときに？' },
  { id: 'munashisa', label: 'むなしい', group: 'くるしみ', plain: '何のためにやっているのか', keywords: ['むなし', '虚し', '意味', '空っぽ', 'やりがい', '無意味'], question: 'なんで？' },
  { id: 'shitto', label: 'うらやましい・妬ましい', group: 'ざわつき', plain: 'あの人ばかりうまくいく', keywords: ['うらやま', '羨ま', '妬', 'ねた', 'ずるい', '比べ'], question: '何が？' },
  { id: 'koukai', label: '後悔している', group: 'くるしみ', plain: 'あのとき、ああしていれば', keywords: ['後悔', 'あのとき', 'すればよかった', 'やり直', '悔や'], question: '何を？' },
  { id: 'zaiakukan', label: '申し訳ない', group: 'くるしみ', plain: '自分のせいだと思ってしまう', keywords: ['申し訳', '罪悪感', 'せいで', '許せない自分', 'ごめん'], question: '誰に？' },
  { id: 'urami', label: '許せない', group: 'くるしみ', plain: 'あの人のことが忘れられない', keywords: ['許せ', '恨', 'うら', '憎', '仕返し'], question: '誰を？' },
  { id: 'jikokeno', label: '自分が嫌い', group: 'くるしみ', plain: 'どうせ自分なんて', keywords: ['自分が嫌', '自己嫌悪', 'どうせ', '価値がな', '向いてな'], question: 'どこが？' },
  { id: 'tsukare', label: '疲れた・もう無理', group: 'くるしみ', plain: '休んでも抜けない', keywords: ['疲れ', 'しんど', 'もう無理', '限界', 'だるい', '休め'], question: 'なんで？' },
  { id: 'mukuwarenai', label: '報われない', group: 'くるしみ', plain: 'やっても誰も見ていない', keywords: ['報われ', '評価', '認められ', '見てくれ', '損', '割に合わ'], question: 'どこで？' },
  { id: 'shi', label: '死・老い・病がこわい', group: 'くるしみ', plain: 'この先どうなるのだろう', keywords: ['死', '老い', '病', '入院', '介護', '余命', 'ガン', 'がん'], question: '誰の？' },
  { id: 'wakare', label: '別れ・喪失', group: 'くるしみ', plain: 'もう会えない', keywords: ['別れ', '亡く', '喪失', '失っ', '葬', '見送', 'ペット'], question: '誰と？' },
  { id: 'ningenkankei', label: '人づきあいが苦しい', group: 'ざわつき', plain: '会いたくない人がいる', keywords: ['人間関係', '職場', '上司', '同僚', '気をつか', '嫌いな人', 'ママ友'], question: '誰と？' },
  { id: 'okane', label: 'お金の心配', group: 'ざわつき', plain: '足りるだろうか', keywords: ['お金', '金銭', '家計', '給料', '年金', '値上げ', '節約'], question: '何が？' },
  { id: 'mayoi', label: '決められない', group: 'ざわつき', plain: 'どちらが正解かわからない', keywords: ['迷', '決めら', '選べ', '正解', 'どっち', '進路'], question: '何を？' },
  { id: 'hikaku', label: '人と比べてしまう', group: 'ざわつき', plain: 'SNSを見ると苦しくなる', keywords: ['比べ', 'SNS', 'インスタ', '同級生', '同期', '周り'], question: 'どこで？' },
  { id: 'shounin', label: '認められたい', group: 'ざわつき', plain: '誰かに見ていてほしい', keywords: ['認め', 'ほめ', '褒め', 'いいね', '承認', '目立'], question: '誰に？' },
  { id: 'isogashii', label: '忙しくて余裕がない', group: 'ざわつき', plain: '時間が足りない', keywords: ['忙し', '時間がな', '余裕', 'バタバタ', '追われ'], question: 'なんで？' },
  { id: 'henka', label: '変化についていけない', group: 'ゆらぎ', plain: '前と同じではいられない', keywords: ['変化', '転職', '引っ越', '定年', '退職', '卒業', 'ついていけ'], question: '何の？' },
  { id: 'kazoku', label: '家族・子育て', group: 'ゆらぎ', plain: '近いからこそ難しい', keywords: ['家族', '子ども', '子育て', '親', '夫', '妻', '嫁', '孫', '介護'], question: '誰のこと？' },
  { id: 'hajimari', label: '新しい門出', group: 'しあわせ', plain: 'これから始まる', keywords: ['入学', '就職', '結婚', '新築', '開店', '出産', '門出', '始ま'], question: '何の？' },
  { id: 'yorokobi', label: 'うれしい・楽しい', group: 'しあわせ', plain: '素直にうれしい', keywords: ['うれし', '嬉し', '楽し', '幸せ', 'しあわせ', '笑'], question: '何が？' },
  { id: 'kansha', label: 'ありがたい', group: 'しあわせ', plain: '誰かのおかげだと思った', keywords: ['ありがた', '感謝', 'おかげ', '助かっ', 'お礼'], question: '誰に？' },
  { id: 'yasuragi', label: '穏やか・満たされている', group: 'しあわせ', plain: '何もないことが心地よい', keywords: ['穏やか', '落ち着', '安らぎ', 'ほっと', '満た'], question: 'どんなとき？' },
  { id: 'tassei', label: 'やりきった', group: 'しあわせ', plain: '一区切りついた', keywords: ['達成', 'やりきっ', '完走', '合格', '成功', '終わっ'], question: '何を？' },
]

export const EMOTION_BY_ID: Record<string, Emotion> = Object.fromEntries(
  EMOTIONS.map((e) => [e.id, e]),
)
