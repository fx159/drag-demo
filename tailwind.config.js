/** @type {import('tailwindcss').Config} */

const spacing = [...Array.from({ length: 1000 })].reduce((prev, _, i) => {
  prev[i] = `${i}px`
  return prev
}, {})

const zIndex = [...Array.from({ length: 1000 })].reduce((prev, _, i) => {
  prev[i] = `${i}`
  return prev
}, {})

const fontSize = [...Array.from({ length: 48 })].reduce((prev, _, i) => {
  prev[i + 12] = `${i + 12}px`
  return prev
}, {})

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    spacing,
    fontSize: {
      ...fontSize,
      base: '14px',
    },
    borderWidth: {
      DEFAULT: '1px',
      1: '1px',
      0: '0px',
      2: '2px',
      4: '4px',
      8: '8px',
    },
    zIndex: {
      auto: 'auto',
      ...zIndex,
    },
    // zIndex: {
    //   auto: 'auto',
    //   0: '0',
    //   1: '1',
    //   10: '10',
    //   20: '20',
    //   30: '30',
    //   40: '40',
    //   50: '50',
    // },
  },
  plugins: [],
}
