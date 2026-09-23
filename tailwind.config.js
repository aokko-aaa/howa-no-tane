/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // モバイルファースト: タップ領域は最低44px
      minHeight: { tap: '44px' },
      minWidth: { tap: '44px' },
      colors: {
        // 墨と生成り。黄緑は一段落として、臙脂は錨として据え置く
        sumi: '#3d3228',
        kinari: '#faf6ec',
        enji: '#9b4a3f',
        matcha: '#5e7139',
        // 陽の当たる草地（帯・見出しの地）
        hidamari: '#f0e0a0',
        wakaba: '#d2dcac',
        kusa: '#7e9450',
        // 手描きの線に使う朱
        shu: '#c2564a',
      },
      fontFamily: {
        maru: ["'Kiwi Maru'", "'Hiragino Mincho ProN'", 'serif'],
      },
    },
  },
  plugins: [],
}
