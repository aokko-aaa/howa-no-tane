import type { EmotionId } from './types'

/** 繰り返し出てくるニュースの型。見出しを、法話の入口に変えるための受け皿。 */
export type NewsTopic = {
  id: string
  label: string
  /** 見出しから拾う語 */
  keywords: string[]
  emotions: EmotionId[]
  /** 報道のトーン（世間はこう受け取る） */
  tone: string
  /** 法話としてどこを見るか */
  angle: string
  caution?: string
}

export const NEWS_TOPICS: NewsTopic[] = [
  {
    id: 'neage',
    label: '値上げ・物価高',
    keywords: ['値上げ', '物価', '高騰', 'インフレ', '光熱費', '電気代', '家計', '節約'],
    emotions: ['okane', 'fuan', 'mukuwarenai'],
    tone: '数字の話として流れていくが、聞いている人の生活はその数字の内側にある。',
    angle: '足りないから欲しくなるのか、足りないと思う癖が欲しがらせるのか、という順番を見る。',
  },
  {
    id: 'zeikin',
    label: '税・年金・社会保障',
    keywords: ['増税', '税', '年金', '保険料', '給付', '制度改正'],
    emotions: ['okane', 'fuan', 'mukuwarenai', 'shi'],
    tone: '損か得かで語られる。',
    angle: '計算でしか受け取れなくなっているものを、受けてきたものの側から数え直す。',
  },
  {
    id: 'saigai',
    label: '地震・豪雨・災害',
    keywords: ['地震', '豪雨', '台風', '津波', '洪水', '避難', '被災', '噴火', '大雪'],
    emotions: ['shi', 'fuan', 'wakare', 'kodoku'],
    tone: '数字と映像で伝わり、数日で流れていく。',
    angle: '順番が決まっていないという事実を、脅しにせずに置く。良寛の手紙が使える。',
    caution: '被災された方が聴衆にいる前提で。教訓や意味づけを急がない。「試練」「おかげで」は言わない。',
  },
  {
    id: 'jiko',
    label: '事故・事件',
    keywords: ['事故', '事件', '逮捕', '容疑', '殺人', '衝突', '火災', '死亡'],
    emotions: ['shi', 'urami', 'zaiakukan', 'fuan'],
    tone: '加害と被害に分けて語られ、見ている側は安全な位置に立つ。',
    angle: '自分は向こう側だと思っている、その線のほうを見る。',
    caution: '実名・詳細に踏み込まない。断罪の材料にしない。遺族・関係者が聴いている可能性を外さない。',
  },
  {
    id: 'fuhou',
    label: '訃報・追悼',
    keywords: ['死去', '逝去', '訃報', '追悼', '死亡', '急逝'],
    emotions: ['wakare', 'shi', 'munashisa'],
    tone: '功績が並べられ、一日で終わる。',
    angle: '会ったことのない人の死が、なぜ自分にこたえるのかを見る。',
    caution: '故人の評価に立ち入らない。真宗では「ご冥福を祈る」と言わない。',
  },
  {
    id: 'shazai',
    label: '謝罪会見・不祥事',
    keywords: ['謝罪', '会見', '不祥事', '辞任', '責任', '釈明', '撤回'],
    emotions: ['zaiakukan', 'shounin', 'urami'],
    tone: '頭を下げ方が採点される。',
    angle: '謝っている人を見ている自分の位置を見る。裁く側は、いつも安全な椅子に座っている。',
    caution: '個人や団体の断罪にしない。',
  },
  {
    id: 'enjo',
    label: 'SNSの炎上・誹謗中傷',
    keywords: ['炎上', 'SNS', '誹謗', '中傷', '投稿', '批判', '拡散'],
    emotions: ['urami', 'shounin', 'iraira', 'hikaku'],
    tone: '正しさが刃物になっていく。',
    angle: '怨みは怨みによって止まず。連鎖を止められるのは、止め方を知っている側だけ。',
  },
  {
    id: 'ai',
    label: 'AI・技術の進歩',
    keywords: ['AI', '人工知能', 'ロボット', 'デジタル', '自動化', 'チャット'],
    emotions: ['henka', 'fuan', 'mayoi', 'munashisa'],
    tone: '便利さと不安が同時に語られる。',
    angle: '答えが早く出る時代に、いちばん知りたいことだけ出てこない、というところを見る。',
  },
  {
    id: 'hitodebusoku',
    label: '人手不足・働きすぎ',
    keywords: ['人手不足', '残業', '過労', '働き方', '休廃業', '長時間'],
    emotions: ['tsukare', 'isogashii', 'mukuwarenai'],
    tone: '生産性の話として処理される。',
    angle: '張りすぎた弦は切れる。中道を、根性論の反対語として出す。',
  },
  {
    id: 'kodokushi',
    label: '孤独・独居',
    keywords: ['孤独', '孤独死', '独居', 'ひとり暮らし', '無縁', '身寄り'],
    emotions: ['kodoku', 'shi', 'kazoku', 'munashisa'],
    tone: '社会問題として数で語られる。',
    angle: '善き友は道の半ばではなく、すべて。つながりを個人の努力にしない。',
    caution: '「かわいそう」で終わらせない。当事者が聴いている前提で。',
  },
  {
    id: 'shoushika',
    label: '少子化・人口減',
    keywords: ['少子化', '出生', '人口減', '過疎', '空き家', '限界集落'],
    emotions: ['kazoku', 'munashisa', 'henka', 'fuan'],
    tone: '減っていく数字として語られる。',
    angle: '続かないものを前提にした上で、今日できることへ降ろす。寺の現実とも重なる。',
  },
  {
    id: 'kaigo',
    label: '高齢化・介護',
    keywords: ['高齢', '介護', '認知症', '老老', '看取り', 'ケア'],
    emotions: ['kazoku', 'tsukare', 'shi', 'zaiakukan'],
    tone: '負担として語られる。',
    angle: '忘己利他は、倒れるまでやれという話ではない。自分の休みも同時に決める。',
    caution: '介護中の方が聴いている。美談にも自己犠牲のすすめにもしない。',
  },
  {
    id: 'iryou',
    label: '医療・健康・病',
    keywords: ['医療', '病院', '治療', '新薬', 'がん', '感染', 'ワクチン', '健康'],
    emotions: ['shi', 'fuan', 'kazoku'],
    tone: '希望と不安が交互に出る。',
    angle: '毒矢のたとえ。原因がすべて分かるまで抜かない、という構えを見る。',
  },
  {
    id: 'juken',
    label: '受験・入学・卒業',
    keywords: ['受験', '入試', '合格', '入学', '卒業', '就活', '内定'],
    emotions: ['hajimari', 'aseri', 'kazoku', 'hikaku'],
    tone: '勝ち負けとして語られる。',
    angle: '柳は緑、花は紅。もともと別物を同じ物差しで測っていなかったか。',
  },
  {
    id: 'sports',
    label: 'スポーツの勝敗',
    keywords: ['優勝', '敗退', '記録', '五輪', '代表', '勝利', '連覇', '逆転'],
    emotions: ['tassei', 'ochikomi', 'hikaku', 'yorokobi'],
    tone: '勝者の物語だけが残る。',
    angle: '有頂天も頂上のこと。そこから落ちる前提まで含めて仏教は見ている。',
  },
  {
    id: 'intai',
    label: '引退・世代交代',
    keywords: ['引退', '退任', '勇退', '最後の', 'ラスト', '世代交代', '閉店', '廃業'],
    emotions: ['henka', 'munashisa', 'wakare', 'mukuwarenai'],
    tone: '惜しまれながら、という枕で流れる。',
    angle: '名刺を配らなくなった日から、自己紹介の仕方がわからなくなる人がいる。',
  },
  {
    id: 'senkyo',
    label: '選挙・政治',
    keywords: ['選挙', '投票', '内閣', '政権', '国会', '与党', '野党', '支持率'],
    emotions: ['iraira', 'mayoi', 'mukuwarenai'],
    tone: '陣営に分かれて語られる。',
    angle: '一水四見。同じ出来事が、立っている場所で別のものに見えるという一点だけを扱う。',
    caution: '特定の政党・候補への支持や批判にしない。寺の立場として踏み込まない。',
  },
  {
    id: 'sensou',
    label: '戦争・紛争',
    keywords: ['戦争', '紛争', '侵攻', '停戦', '空爆', '難民', '軍事'],
    emotions: ['urami', 'shi', 'fuan', 'kodoku'],
    tone: '遠い出来事として数字で入ってくる。',
    angle: '怨みは怨みによって止まず。遠くの話を、自分の中の同じ仕組みへ返す。',
    caution: '当事国の是非に踏み込まない。抽象論で済ませない。',
  },
  {
    id: 'kankyou',
    label: '気候・環境',
    keywords: ['猛暑', '気候', '温暖化', '環境', '記録的', '異常気象', '大雨'],
    emotions: ['fuan', 'henka', 'tsukare'],
    tone: '記録更新として毎年繰り返される。',
    angle: '去年と同じ夏はもう来ない、という実感から無常へ。説教にしない。',
  },
  {
    id: 'sagi',
    label: '詐欺・特殊詐欺',
    keywords: ['詐欺', '特殊詐欺', '被害', '闇バイト', '不正', '送金'],
    emotions: ['okane', 'urami', 'kazoku', 'fuan'],
    tone: '引っかかった側の不注意として語られがち。',
    angle: '人を疑えという話にせず、なぜその一言に動いてしまうのかを見る。',
    caution: '被害に遭った方を責める形にしない。',
  },
  {
    id: 'ooatari',
    label: '大当たり・幸運',
    keywords: ['宝くじ', '高額', '当選', '当たり', '記録的な人出', '爆売れ'],
    emotions: ['yorokobi', 'okane', 'shitto', 'hikaku'],
    tone: 'うらやましさとセットで消費される。',
    angle: '他人の牛を数える。数えた分だけ、自分の時間が減っている。',
  },
  {
    id: 'hokkori',
    label: '動物・ほっこり話題',
    keywords: ['パンダ', '赤ちゃん', '保護', '再会', '感動', '話題', 'ほっこり'],
    emotions: ['yorokobi', 'yasuragi', 'kansha'],
    tone: '箸休めとして流れる。',
    angle: '軽い話題こそ、ありがたさ（有り難し＝めったにない）の入口にできる。',
  },
  {
    id: 'ryuukou',
    label: '流行・ランキング',
    keywords: ['流行', 'ランキング', '人気', 'トレンド', '話題の', '行列', 'バズ'],
    emotions: ['hikaku', 'henka', 'shounin'],
    tone: '今年の言葉、今年の顔として毎年入れ替わる。',
    angle: '入れ替わることを前提にした言葉が、毎年まじめに発表されている面白さから入る。',
  },
  {
    id: 'kaigai',
    label: '海外・為替・株',
    keywords: ['円安', '円高', '株価', '市場', '為替', '経済', '景気'],
    emotions: ['okane', 'fuan', 'aseri'],
    tone: '上がった下がったで一日が終わる。',
    angle: '上下する数字を見ている時間と、手元が変わらない現実を並べる。',
  },
]

export const NEWS_TOPIC_BY_ID: Record<string, NewsTopic> = Object.fromEntries(
  NEWS_TOPICS.map((t) => [t.id, t]),
)

/** 実際の出来事を法話に使うときの、共通の心得 */
export const NEWS_CAUTION =
  '実際の出来事を材料にするときは、当事者が聴衆にいる前提で。実名や詳細に踏み込まない、断罪しない、意味づけを急がない。'
