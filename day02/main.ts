import { TextLineStream } from 'jsr:@std/streams/text-line-stream'

const file = await Deno.open('input')

function isSafe(levels: number[]) {
  const isIncreasing = levels.slice(1).every((level, i) => level > levels[i])
  const isDecreasing = levels.slice(1).every((level, i) => level < levels[i])
  const hasValidDifferences = levels.slice(1).every((level, i) =>
    Math.abs(level - levels[i]) <= 3
  )
  return (isIncreasing || isDecreasing) && hasValidDifferences
}

function isSafeWithTolerance(levels: number[]) {
  return levels.some((_, i) =>
    isSafe([...levels.slice(0, i), ...levels.slice(i + 1)])
  )
}

let safeReports = 0
let safeReportsWithTolerance = 0
for await (
  const line of file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream())
) {
  const levels = line.split(' ').map(Number)
  safeReports += Number(isSafe(levels))
  safeReportsWithTolerance += Number(isSafeWithTolerance(levels))
}

console.log(safeReports)
console.log(safeReportsWithTolerance)
