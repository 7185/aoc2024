import { TextLineStream } from 'jsr:@std/streams/text-line-stream'

const file = await Deno.open('input')

const lines: string[] = []
const xmas = 'XMAS'
let total = 0
let totalCross = 0

for await (
  const line of file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream())
) {
  lines.push(line)
  // Horizontal
  total += line.split(xmas).length - 1
  total += line.split(xmas.split('').reverse().join('')).length - 1
}

const cols = lines[0].length
const rows = lines.length

for (let col = 0; col < cols; col++) {
  let vertical = ''

  for (let row = 0; row < rows; row++) {
    vertical += lines[row][col]
  }

  total += vertical.split(xmas).length - 1
  total += vertical.split(xmas.split('').reverse().join('')).length - 1
}

for (let row = 0; row <= rows - xmas.length; row++) {
  for (let col = 0; col <= cols - xmas.length; col++) {
    let downDiagonal = ''

    for (let i = 0; i < xmas.length; i++) {
      downDiagonal += lines[row + i][col + i]
    }

    total += downDiagonal.split(xmas).length - 1
    total += downDiagonal.split(xmas.split('').reverse().join('')).length - 1
  }
}

for (let row = xmas.length - 1; row < rows; row++) {
  for (let col = 0; col <= cols - xmas.length; col++) {
    let upDiagonal = ''

    for (let i = 0; i < xmas.length; i++) {
      upDiagonal += lines[row - i][col + i]
    }

    total += upDiagonal.split(xmas).length - 1
    total += upDiagonal.split(xmas.split('').reverse().join('')).length - 1
  }
}

// ----

function checkCross(row: number, col: number): boolean {
  const center = lines[row][col]
  if (center !== 'A') return false

  const topLeft = lines[row - 1][col - 1]
  const topRight = lines[row - 1][col + 1]
  const bottomLeft = lines[row + 1][col - 1]
  const bottomRight = lines[row + 1][col + 1]

  // M.M   S.M   S.S   M.S
  // .A.   .A.   .A.   .A.
  // S.S   S.M   M.M   M.S

  return (
    (topLeft === 'M' && topRight === 'M' && bottomLeft === 'S' &&
      bottomRight === 'S') ||
    (topLeft === 'S' && topRight === 'M' && bottomLeft === 'S' &&
      bottomRight === 'M') ||
    (topLeft === 'S' && topRight === 'S' && bottomLeft === 'M' &&
      bottomRight === 'M') ||
    (topLeft === 'M' && topRight === 'S' && bottomLeft === 'M' &&
      bottomRight === 'S')
  )
}

for (let row = 1; row < rows - 1; row++) {
  for (let col = 1; col < cols - 1; col++) {
    if (checkCross(row, col)) {
      totalCross++
    }
  }
}

console.log(total)
console.log(totalCross)
