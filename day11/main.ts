import { memoize } from 'jsr:@std/cache'

const file = await Deno.readTextFile('input')
const data = file.split(' ').map(Number)

const count = memoize((stone: number, blink: number): number => {
  // end recursion, we're done for this stone so we count it as one
  if (blink === 0) return 1
  if (stone === 0) return count(1, blink - 1)

  const length = Math.floor(Math.log10(stone)) + 1

  if (length % 2 === 0) {
    const half = Math.pow(10, Math.floor(length / 2))
    return count(Math.floor(stone / half), blink - 1) +
      count(stone % half, blink - 1)
  }

  return count(stone * 2024, blink - 1)
})

console.log(data.reduce((sum, stone) => sum + count(stone, 25), 0))
console.log(data.reduce((sum, stone) => sum + count(stone, 75), 0))
