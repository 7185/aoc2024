import { TextLineStream } from 'jsr:@std/streams/text-line-stream'

const file = await Deno.open('input')

const rules: [string, string][] = []
const updates: string[][] = []
for await (
  const line of file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream())
) {
  if (line === '') continue
  const split = line.split('|')
  if (split.length === 2) {
    rules.push(split as [string, string])
  } else {
    updates.push(line.split(','))
  }
}

function isValidUpdate(update: string[]): boolean {
  for (let i = 0; i < update.length - 1; i++) {
    const pagesBefore = rules.filter((r) => r[1] === update[i]).map((r) => r[0])
    if (pagesBefore.some((r) => update.slice(i).includes(r))) return false
  }
  return true
}

function comparePages(a: string, b: string): number {
  for (const [before, after] of rules) {
    if (a === before && b === after) return -1
    if (a === after && b === before) return 1
  }
  return 0
}

function findMiddlePage(update: string[]): string {
  for (const page of update) {
    const greaterCount = update.filter((p) => comparePages(page, p) < 0).length
    // Exactly half of the other pages are greater, so the current page is the middle one
    if (greaterCount === Math.floor(update.length / 2)) return page
  }
  return update[Math.floor(update.length / 2)]
}

const validMiddlePages = updates
  .filter(isValidUpdate)
  .map((update) => update[Math.floor(update.length / 2)])
console.log(validMiddlePages.reduce((acc, n) => acc + Number(n), 0))

const invalidMiddlePages = updates
  .filter((update) => !isValidUpdate(update))
  .map(findMiddlePage)
console.log(invalidMiddlePages.reduce((acc, n) => acc + Number(n), 0))
