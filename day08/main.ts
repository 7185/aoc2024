import { TextLineStream } from 'jsr:@std/streams/text-line-stream'

const file = await Deno.open('input')
const grid: string[] = []

for await (
  const line of file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream())
) {
  grid.push(line)
}

const antennas: Record<string, [number, number][]> = {}

for (let row = 0; row < grid.length; row++) {
  for (let col = 0; col < grid[0].length; col++) {
    if (grid[row][col] !== '.') {
      if (!(grid[row][col] in antennas)) {
        antennas[grid[row][col]] = []
      }
      antennas[grid[row][col]].push([row, col])
    }
  }
}

const inBounds = (row: number, col: number): boolean => {
  return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length
}

const calculateAntinodes = (
  coords: [number, number][],
  repeat: boolean,
): Set<string> => {
  const antinodes = new Set<string>()

  for (let i = 0; i < coords.length; i++) {
    for (let j = 0; j < coords.length; j++) {
      if (i === j) continue // Avoid same antenna
      const [x1, y1] = coords[i]
      const [x2, y2] = coords[j]

      if (!repeat) {
        const antinodeX = 2 * x1 - x2
        const antinodeY = 2 * y1 - y2
        if (inBounds(antinodeX, antinodeY)) {
          antinodes.add(`${antinodeX}_${antinodeY}`)
        }
      } else {
        // Part 2 - repeating antinodes
        for (let k = 0; k <= grid.length; k++) {
          const newFirstRow = x1 + k * (x1 - x2)
          const newFirstCol = y1 + k * (y1 - y2)
          const newSecondRow = x2 - k * (x1 - x2)
          const newSecondCol = y2 - k * (y1 - y2)
          if (inBounds(newFirstRow, newFirstCol)) {
            antinodes.add(`${newFirstRow}_${newFirstCol}`)
          }
          if (inBounds(newSecondRow, newSecondCol)) {
            antinodes.add(`${newSecondRow}_${newSecondCol}`)
          }
        }
      }
    }
  }
  return antinodes
}

const getAntinodesCount = (repeat: boolean): number => {
  const allAntinodes = new Set<string>()
  for (const coords of Object.values(antennas)) {
    for (const k of calculateAntinodes(coords, repeat)) {
      allAntinodes.add(k)
    }
  }
  return allAntinodes.size
}

console.log(getAntinodesCount(false))
console.log(getAntinodesCount(true))
