import type { EmotionId, Reason } from './types'

// 気持ちの一段下。「イライラする」だけでは当てようがないので、
// 「なんで？」「何が？」まで降りてから素材を選ぶ。
// emotions はその理由で足される気持ち、concepts はとくに当たりやすい言葉。
export const REASONS: Record<EmotionId, Reason[]> = {
  iraira: [
    { id: 'iraira-omoidoori', label: '思い通りにいかない', emotions: ['aseri', 'mukuwarenai'], concepts: ['issai-kaiku', 'engi'] },
    { id: 'iraira-taichou', label: '疲れている・体調がよくない', emotions: ['tsukare', 'isogashii'], concepts: ['chudo', 'bonbu'] },
    { id: 'iraira-hito', label: 'あの人が許せない', emotions: ['urami', 'ningenkankei'], concepts: ['onmi-wa-yamazu', 'ninniku'] },
    { id: 'iraira-jibun', label: '自分に腹が立っている', emotions: ['jikokeno', 'koukai'], concepts: ['bonbu', 'daini-no-ya'] },
  ],
  fuan: [
    { id: 'fuan-shourai', label: '将来のこと', emotions: ['mayoi', 'henka'], concepts: ['makumouzou', 'genshou-shoujouju'] },
    { id: 'fuan-okane', label: 'お金のこと', emotions: ['okane'], concepts: ['shoyoku-chisoku', 'muge-no-ichido'] },
    { id: 'fuan-kenkou', label: '健康・病気のこと', emotions: ['shi'], concepts: ['heizei-gojou', 'namuamidabutsu'] },
    { id: 'fuan-kazoku', label: '家族のこと', emotions: ['kazoku'], concepts: ['jihi', 'moko-rita'] },
    { id: 'fuan-me', label: '人からどう見られるか', emotions: ['shounin', 'hikaku'], concepts: ['sesshu-fusha', 'mukudoku'] },
  ],
  aseri: [
    { id: 'aseri-shimekiri', label: '時間がない・締切が近い', emotions: ['isogashii'], concepts: ['chudo', 'shoji-jidai'] },
    { id: 'aseri-mawari', label: '周りが先に進んでいる', emotions: ['hikaku', 'shounin'], concepts: ['yanagi-midori', 'tanin-no-takara'] },
    { id: 'aseri-junbi', label: '準備ができていない', emotions: ['fuan'], concepts: ['shokorikkyaka', 'ichinen-hokki'] },
  ],
  ochikomi: [
    { id: 'ochi-shippai', label: '失敗してしまった', emotions: ['koukai', 'jikokeno'], concepts: ['daini-no-ya', 'bonbu'] },
    { id: 'ochi-hitei', label: '人に否定された', emotions: ['shounin', 'ningenkankei'], concepts: ['sesshu-fusha', 'issui-shiken'] },
    { id: 'ochi-dekinai', label: 'うまくできない自分に', emotions: ['jikokeno'], concepts: ['nishu-jinshin', 'akunin-shoki'] },
  ],
  kodoku: [
    { id: 'kodoku-ie', label: '家に誰もいない', emotions: ['munashisa'], concepts: ['namuamidabutsu', 'ichinin-no-tame'] },
    { id: 'kodoku-hanashi', label: '話を聞いてもらえない', emotions: ['ningenkankei'], concepts: ['doubou', 'jihi'] },
    { id: 'kodoku-inai', label: '大切な人がいなくなってから', emotions: ['wakare'], concepts: ['gensou-ekou', 'ojodo'] },
  ],
  munashisa: [
    { id: 'muna-nanno', label: '何のためにやっているのか', emotions: ['mayoi', 'mukuwarenai'], concepts: ['ichigu-wo-terasu', 'zuisho-ni-shu'] },
    { id: 'muna-dare', label: '誰も見ていない', emotions: ['shounin', 'mukuwarenai'], concepts: ['mukudoku', 'ichigu-wo-terasu'] },
    { id: 'muna-yotei', label: 'することがない', emotions: ['yasuragi'], concepts: ['shikan-taza', 'nichinichi-kore-koujitsu'] },
  ],
  shitto: [
    { id: 'shitto-kurashi', label: '人の暮らしぶりが', emotions: ['hikaku', 'okane'], concepts: ['tanin-no-takara', 'yanagi-midori'] },
    { id: 'shitto-hyouka', label: '評価されている人が', emotions: ['shounin'], concepts: ['mukudoku', 'zuiki'] },
    { id: 'shitto-motenai', label: '自分が持っていないものが', emotions: ['okane', 'mukuwarenai'], concepts: ['shoyoku-chisoku', 'zuiki'] },
  ],
  koukai: [
    { id: 'kou-itta', label: '言ってしまったこと', emotions: ['urami', 'ningenkankei'], concepts: ['ninniku', 'onmi-wa-yamazu'] },
    { id: 'kou-yaranakatta', label: 'やらなかったこと', emotions: ['mayoi'], concepts: ['zengo-saidan', 'ichinen-hokki'] },
    { id: 'kou-maniawanai', label: '間に合わなかったこと', emotions: ['wakare', 'zaiakukan'], concepts: ['inga-fumai', 'akunin-shoki'] },
  ],
  zaiakukan: [
    { id: 'zai-kazoku', label: '家族に', emotions: ['kazoku'], concepts: ['moko-rita', 'bonbu'] },
    { id: 'zai-koujin', label: '亡くなった人に', emotions: ['wakare', 'shi'], concepts: ['gensou-ekou', 'houon'] },
    { id: 'zai-mawari', label: '周りに迷惑をかけた', emotions: ['ningenkankei'], concepts: ['akunin-shoki', 'bonbu'] },
  ],
  urami: [
    { id: 'ura-mijika', label: '身近な人を', emotions: ['ningenkankei', 'kazoku'], concepts: ['sha', 'jihi'] },
    { id: 'ura-rifujin', label: '理不尽な出来事を', emotions: ['mukuwarenai'], concepts: ['issui-shiken', 'onmi-wa-yamazu'] },
    { id: 'ura-jibun', label: '自分自身を', emotions: ['jikokeno'], concepts: ['bonbu', 'nishu-jinshin'] },
  ],
  jikokeno: [
    { id: 'jiko-tsuzukanai', label: '何をやっても続かない', emotions: ['tsukare'], concepts: ['ichinen-hokki', 'bonbu'] },
    { id: 'jiko-kurabe', label: '人と比べてしまう', emotions: ['hikaku'], concepts: ['yanagi-midori', 'tanin-no-takara'] },
    { id: 'jiko-kako', label: '過去のことが消えない', emotions: ['koukai'], concepts: ['zengo-saidan', 'akunin-shoki'] },
  ],
  tsukare: [
    { id: 'tsuka-yasumenai', label: '休めていない', emotions: ['isogashii'], concepts: ['chudo', 'shikan-taza'] },
    { id: 'tsuka-mukuwarenai', label: 'がんばっても報われない', emotions: ['mukuwarenai'], concepts: ['mukudoku', 'zuisho-ni-shu'] },
    { id: 'tsuka-kiwotsukau', label: '気を使いすぎている', emotions: ['ningenkankei'], concepts: ['sha', 'wagen-aigo'] },
  ],
  mukuwarenai: [
    { id: 'muku-shigoto', label: '仕事で', emotions: ['shounin', 'isogashii'], concepts: ['ichigu-wo-terasu', 'zuisho-ni-shu'] },
    { id: 'muku-ie', label: '家の中で', emotions: ['kazoku'], concepts: ['moko-rita', 'muzai-shichise'] },
    { id: 'muku-kaigo', label: '介護や世話で', emotions: ['kazoku', 'tsukare'], concepts: ['moko-rita', 'houon'] },
  ],
  shi: [
    { id: 'shi-jibun', label: '自分のこと', emotions: ['fuan'], concepts: ['heizei-gojou', 'namuamidabutsu'] },
    { id: 'shi-kazoku', label: '家族のこと', emotions: ['kazoku', 'wakare'], concepts: ['ojodo', 'jihi'] },
    { id: 'shi-sakiganai', label: '先が見えないこと', emotions: ['fuan', 'henka'], concepts: ['shogyo-mujo', 'genshou-shoujouju'] },
  ],
  wakare: [
    { id: 'wak-kazoku', label: '家族と', emotions: ['kazoku'], concepts: ['gensou-ekou', 'ojodo'] },
    { id: 'wak-chijin', label: '友人・知人と', emotions: ['ningenkankei'], concepts: ['ichigo-ichie', 'shogyo-mujo'] },
    { id: 'wak-pet', label: 'ペットと', emotions: ['kodoku'], concepts: ['shogyo-mujo', 'arigatashi'] },
    { id: 'wak-aenai', label: '会えなくなった人と', emotions: ['kodoku', 'henka'], concepts: ['ichigo-ichie', 'gensou-ekou'] },
  ],
  ningenkankei: [
    { id: 'nin-shokuba', label: '職場の人と', emotions: ['shounin', 'isogashii'], concepts: ['sha', 'issui-shiken'] },
    { id: 'nin-shinzoku', label: '家族・親戚と', emotions: ['kazoku'], concepts: ['deshi-ichinin', 'jihi'] },
    { id: 'nin-kinjo', label: 'ご近所・地域と', emotions: ['kodoku'], concepts: ['kissako', 'wagen-aigo'] },
  ],
  okane: [
    { id: 'kane-kurashi', label: '毎月の暮らしが', emotions: ['fuan'], concepts: ['shoyoku-chisoku', 'muzai-shichise'] },
    { id: 'kane-rougo', label: '老後のことが', emotions: ['shi'], concepts: ['heizei-gojou', 'shoyoku-chisoku'] },
    { id: 'kane-kurabe', label: '人と比べてしまう', emotions: ['hikaku'], concepts: ['tanin-no-takara', 'yanagi-midori'] },
  ],
  mayoi: [
    { id: 'may-shinro', label: '進路・仕事を', emotions: ['henka'], concepts: ['oumushojuu', 'shokorikkyaka'] },
    { id: 'may-kazoku', label: '家族のことを', emotions: ['kazoku'], concepts: ['jihi', 'deshi-ichinin'] },
    { id: 'may-tsuzukeru', label: '続けるかやめるかを', emotions: ['tsukare'], concepts: ['akirameru', 'chudo'] },
  ],
  hikaku: [
    { id: 'hik-sns', label: 'SNSを見て', emotions: ['shounin'], concepts: ['tanin-no-takara', 'mukudoku'] },
    { id: 'hik-douki', label: '同期・同級生と', emotions: ['shounin', 'shitto'], concepts: ['yanagi-midori', 'zuiki'] },
    { id: 'hik-kyoudai', label: '家族・きょうだいと', emotions: ['kazoku'], concepts: ['yanagi-midori', 'deshi-ichinin'] },
  ],
  shounin: [
    { id: 'sho-shokuba', label: '職場で', emotions: ['mukuwarenai'], concepts: ['mukudoku', 'ichigu-wo-terasu'] },
    { id: 'sho-kazoku', label: '家族に', emotions: ['kazoku'], concepts: ['deshi-ichinin', 'wagen-aigo'] },
    { id: 'sho-yononaka', label: '世の中に', emotions: ['hikaku'], concepts: ['mukudoku', 'shoho-muga'] },
  ],
  isogashii: [
    { id: 'iso-shigoto', label: '仕事に追われて', emotions: ['aseri'], concepts: ['chudo', 'shoji-jidai'] },
    { id: 'iso-ie', label: '家のことで手一杯', emotions: ['kazoku', 'tsukare'], concepts: ['moko-rita', 'zuisho-ni-shu'] },
    { id: 'iso-ooi', label: 'やることが多すぎて', emotions: ['tsukare'], concepts: ['shokorikkyaka', 'shoji-jidai'] },
  ],
  henka: [
    { id: 'hen-yakuwari', label: '仕事・役割が変わった', emotions: ['mukuwarenai', 'munashisa'], concepts: ['zuisho-ni-shu', 'hisou-hizoku'] },
    { id: 'hen-karada', label: '体が思うように動かない', emotions: ['shi'], concepts: ['shogyo-mujo', 'heizei-gojou'] },
    { id: 'hen-mawari', label: 'まわりの人が変わった', emotions: ['ningenkankei', 'wakare'], concepts: ['shogyo-mujo', 'ichigo-ichie'] },
  ],
  kazoku: [
    { id: 'kaz-kodomo', label: '子どものこと', emotions: ['yorokobi', 'mayoi'], concepts: ['deshi-ichinin', 'jihi'] },
    { id: 'kaz-oya', label: '親のこと・介護', emotions: ['tsukare', 'shi'], concepts: ['moko-rita', 'houon'] },
    { id: 'kaz-tsureai', label: '連れ合いのこと', emotions: ['ningenkankei'], concepts: ['wagen-aigo', 'sha'] },
  ],
  hajimari: [
    { id: 'haji-nyugaku', label: '入学・就職', emotions: ['aseri', 'kazoku'], concepts: ['ichinen-hokki', 'shokorikkyaka'] },
    { id: 'haji-kekkon', label: '結婚・出産', emotions: ['yorokobi', 'kazoku'], concepts: ['ichigo-ichie', 'arigatashi'] },
    { id: 'haji-hikkoshi', label: '引っ越し・新築', emotions: ['henka'], concepts: ['onaibutsu', 'ryouji-kichijitsu'] },
  ],
  yorokobi: [
    { id: 'yoro-yoikoto', label: 'よいことがあった', emotions: ['tassei'], concepts: ['arigatashi', 'shogyo-mujo'] },
    { id: 'yoro-yasashi', label: '人に優しくされた', emotions: ['kansha'], concepts: ['muzai-shichise', 'wagen-aigo'] },
    { id: 'yoro-nanimonai', label: '何でもない一日が', emotions: ['yasuragi'], concepts: ['nichinichi-kore-koujitsu', 'arigatashi'] },
  ],
  kansha: [
    { id: 'kan-kazoku', label: '家族に', emotions: ['kazoku'], concepts: ['houon', 'ondokusan'] },
    { id: 'kan-tasuke', label: '助けてくれた人に', emotions: ['ningenkankei'], concepts: ['muzai-shichise', 'arigatashi'] },
    { id: 'kan-nakihito', label: '亡き人に', emotions: ['wakare'], concepts: ['houon', 'gensou-ekou'] },
  ],
  yasuragi: [
    { id: 'yasu-nanimonai', label: '何もない一日に', emotions: ['munashisa'], concepts: ['nichinichi-kore-koujitsu', 'shikan-taza'] },
    { id: 'yasu-teawase', label: '手を合わせたとき', emotions: ['kansha'], concepts: ['namuamidabutsu', 'monbou'] },
    { id: 'yasu-hito', label: '人といるとき', emotions: ['ningenkankei'], concepts: ['doubou', 'kissako'] },
  ],
  tassei: [
    { id: 'tas-tsuzuketa', label: '長く続けたことを', emotions: ['hajimari'], concepts: ['ichinen-hokki', 'zuisho-ni-shu'] },
    { id: 'tas-yakume', label: '大きな役目を終えて', emotions: ['henka', 'munashisa'], concepts: ['mukudoku', 'hisou-hizoku'] },
    { id: 'tas-okage', label: '人に助けられて', emotions: ['kansha'], concepts: ['shoho-muga', 'houon'] },
  ],
}

export const REASON_BY_ID: Record<string, Reason> = Object.fromEntries(
  Object.values(REASONS).flat().map((r) => [r.id, r]),
)

/** その気持ちに紐づく「なんで？」の選択肢 */
export function reasonsFor(emotionId: EmotionId): Reason[] {
  return REASONS[emotionId] ?? []
}
