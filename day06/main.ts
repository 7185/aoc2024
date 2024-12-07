import { TextLineStream } from 'jsr:@std/streams/text-line-stream'

const file = await Deno.open('input')
let lines: string[] = []

for await (
  const line of file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream())
) {
  lines.push(line)
}

const linesOrig = [...lines]

function replaceCharAt(str: string, char: string, at: number): string {
  return str.substring(0, at) + char + str.substring(at + 1)
}

const directions = [
  { symbol: '^', dx: 0, dy: -1, next: '>' },
  { symbol: '>', dx: 1, dy: 0, next: 'v' },
  { symbol: 'v', dx: 0, dy: 1, next: '<' },
  { symbol: '<', dx: -1, dy: 0, next: '^' },
]

function step(): boolean {
  for (const dir of directions) {
    for (let row = 0; row < lines.length; row++) {
      const column = lines[row].indexOf(dir.symbol)
      if (column < 0) continue // symbol not found

      const newRow = row + dir.dy
      const newColumn = column + dir.dx

      if (
        newRow < 0 || newRow >= lines.length || newColumn < 0 ||
        newColumn >= lines[row].length
      ) {
        // oob
        lines[row] = replaceCharAt(lines[row], 'X', column)
        return false
      }

      if (lines[newRow][newColumn] !== '#') {
        lines[row] = replaceCharAt(lines[row], 'X', column)
        lines[newRow] = replaceCharAt(lines[newRow], dir.symbol, newColumn)
        return true
      } else {
        // change direction
        lines[row] = replaceCharAt(lines[row], dir.next, column)
      }
    }
  }
  return step()
}

let moving
do {
  moving = step()
} while (moving)

console.log(lines.join('').split('X').length - 1)

// ----

const linesPart1 = [...lines]
// Reset grid
lines = [...linesOrig]

// States
const CONTINUE = 0
const OUT_OF_BOUNDS = 1
const LOOP_DETECTED = 2

function stepGrid(grid: string[], visited: Set<string>): number {
  for (const dir of directions) {
    for (let row = 0; row < grid.length; row++) {
      const column = grid[row].indexOf(dir.symbol)
      if (column < 0) continue // symbole not found

      const newRow = row + dir.dy
      const newColumn = column + dir.dx
      if (visited.has(`${row}_${column}_${dir.symbol}`)) {
        return LOOP_DETECTED
      }
      if (
        newRow < 0 || newRow >= grid.length || newColumn < 0 ||
        newColumn >= grid[row].length
      ) {
        // oob
        grid[row] = replaceCharAt(grid[row], 'X', column)
        return OUT_OF_BOUNDS
      }

      if (grid[newRow][newColumn] !== '#') {
        grid[row] = replaceCharAt(grid[row], 'X', column)
        grid[newRow] = replaceCharAt(grid[newRow], dir.symbol, newColumn)
        visited.add(`${row}_${column}_${dir.symbol}`)
        return CONTINUE
      } else {
        // change direction
        grid[row] = replaceCharAt(grid[row], dir.next, column)
      }
    }
  }

  return CONTINUE
}

let loopCount = 0

for (let row = 0; row < lines.length; row++) {
  for (let col = 0; col < lines[row].length; col++) {
    // We only place one wall so it makes sense to put it only on visited cells from part 1
    if (lines[row][col] === '.' && linesPart1[row][col] === 'X') {
      const newGrid = [...lines]
      newGrid[row] = replaceCharAt(newGrid[row], '#', col)
      const visited = new Set<string>()
      let status

      do {
        status = stepGrid(newGrid, visited)
      } while (status === CONTINUE)

      if (status === LOOP_DETECTED) {
        loopCount++
      }
    }
  }
}

console.log(loopCount)
