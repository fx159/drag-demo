/** @type {import('tailwindcss').Config} */

const spacing = [...Array.from({ length: 1000 })].reduce((prev, _, i) => {
  prev[i] = `${i}px`
  return prev
}, {})
const lineHeight = [...Array.from({ length: 1000 })].reduce((prev, _, i) => {
  prev[i] = `${i}px`
  return prev
}, {})
const rounded = [...Array.from({ length: 1000 })].reduce((prev, _, i) => {
  prev[i] = `${i}px`
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
    extend: {
      zIndex: {
        1: '1',
        10: '10',
      },
    },
  },
  plugins: [],
}
