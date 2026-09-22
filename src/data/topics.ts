import type { Topic, TopicId } from './types'

/**
 * 話題。素材どうしをつなぐための層。
 *
 * 気持ちのタグだけでつなぐと荒すぎる。
 * 「鏡に映った自分」と「他力本願」と「解約し忘れたサブスク」が
 * 〈自己嫌悪〉というタグ一つで同じ話にされてしまう。
 * 入口・問い・たとえが同じ話題を向いているかどうかを、ここで見る。
 */
export const TOPICS: Topic[] = [
  { id: 'tayoru', label: 'たよる・ひとりで抱える', note: '人をあてにすること、支えられていたこと' },
  { id: 'owaranai', label: '終わりのない仕事', note: '家事・育児・介護・毎日の繰り返し' },
  { id: 'sakinobashi', label: '先延ばし・動けない', note: '分かっているのに手がつかない' },
  { id: 'kuraberu', label: '人と比べる', note: 'SNS・同期・持ち物・進み方' },
  { id: 'naoranai', label: '直らない自分', note: '反省しても同じことをする' },
  { id: 'miraretakata', label: '人からどう見られるか', note: '評価・沈黙・返事の速さ' },
  { id: 'mukuwarenai', label: '報われない', note: 'やっても誰も見ていない' },
  { id: 'isogashii', label: '時間に追われる', note: '締切・移動・通知・休めない' },
  { id: 'ikari', label: '怒り・やり返す', note: '言い返せなかった／許せない' },
  { id: 'tebanasu', label: '手放せない', note: '捨てられない・こだわり・執着' },
  { id: 'yakuwari', label: '役割と自分', note: '肩書き・立場・引き際' },
  { id: 'shi-wakare', label: '死・別れ', note: '看取り・法事・残されたもの' },
  { id: 'okane', label: 'お金・損得', note: '家計・損したくない気持ち' },
  { id: 'atarimae', label: 'あたりまえ・ありがたさ', note: 'ふだん数えていないもの' },
  { id: 'hito', label: '人づきあい・家族', note: '近い人ほど難しい' },
  { id: 'hajimari', label: '節目・はじまり', note: '入学・初任給・定年・年の変わり目' },
  { id: 'wakaranai', label: '分からない・迷い', note: '答えの出ない問いを抱える' },
]

export const TOPIC_BY_ID: Record<string, Topic> = Object.fromEntries(
  TOPICS.map((t) => [t.id, t]),
)

export const TOPIC_IDS: TopicId[] = TOPICS.map((t) => t.id)
