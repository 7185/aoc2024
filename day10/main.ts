import { TextLineStream } from 'jsr:@std/streams/text-line-stream'

type Pos = `${number}_${number}`

const grid = new Map<Pos, number>()
const file = await Deno.open('input')

let y = 0
for await (
  const line of file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream())
) {
  line.split('').forEach((c, x) => grid.set(`${x}_${y}`, parseInt(c)))
  y++
}

const search = (start: Pos, memo = true): number => {
  const toVisit: Pos[] = [start]
  const visited = new Set<Pos>()
  let trails = 0

  while (toVisit.length > 0) {
    const pos = toVisit.shift()!
    if (memo) {
      if (visited.has(pos)) continue
      visited.add(pos)
    }

    if (grid.get(pos) === 9) {
      // New path found
      trails++
    }

    const [x, y] = pos.split('_').map(Number)
    const neighbors: Pos[] = [
      `${x + 1}_${y}`,
      `${x - 1}_${y}`,
      `${x}_${y + 1}`,
      `${x}_${y - 1}`,
    ]

    // Find higher neighbor if any
    neighbors.filter((newPos) =>
      grid.has(newPos) && grid.get(newPos) === grid.get(pos)! + 1
    ).forEach((newPos) => toVisit.push(newPos))
  }

  return trails
}

const zeros: Pos[] = []
grid.forEach((value, pos) => {
  if (value === 0) zeros.push(pos)
})

const computeTotal = (memo = true) => {
  return zeros
    .reduce((sum, pos) => sum + search(pos, memo), 0)
}

console.log(computeTotal())
console.log(computeTotal(false))
