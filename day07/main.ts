import { TextLineStream } from 'jsr:@std/streams/text-line-stream'

const file = await Deno.open('input')

const lines: number[][] = []
for await (
  const line of file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream())
) {
  const equation = line.split(': ')
  lines.push([Number(equation[0]), ...equation[1].split(' ').map(Number)])
}

const isResultPossible = (
  result: number,
  nums: number[],
  allowConcat: boolean,
): boolean => {
  // We can make 0 without using any number
  let possibleResults = new Set<number>([0])

  for (const nextNumber of nums) {
    const newResults = new Set<number>()

    for (const possibleNumber of possibleResults) {
      if (result >= possibleNumber + nextNumber) {
        newResults.add(possibleNumber + nextNumber)
      }
      if (result >= possibleNumber * nextNumber) {
        newResults.add(possibleNumber * nextNumber)
      }
      if (allowConcat && result >= parseInt(`${possibleNumber}${nextNumber}`)) {
        newResults.add(parseInt(`${possibleNumber}${nextNumber}`))
      }
    }

    // Update results
    possibleResults = newResults
  }

  return possibleResults.has(result)
}

const computeTotal = (allowConcat: boolean) => {
  let total = 0
  for (const line of lines) {
    const [result, ...numbers] = line
    if (isResultPossible(result, numbers, allowConcat)) {
      total += result
    }
  }

  return total
}

console.log(computeTotal(false))
console.log(computeTotal(true))
