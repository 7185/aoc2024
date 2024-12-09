const file = await Deno.open('input')

let disk = ''
let ordered = ''
for await (
  const line of file.readable
    .pipeThrough(new TextDecoderStream())
) {
  disk = line
}

disk.split(/(.{2})/)
  .filter((x) => x.length == 2)
  .entries()
  .forEach(([i, n]) =>
    // 48 is the charCode for 0
    ordered += String.fromCodePoint(i + 48).repeat(Number(n[0])) +
      '.'.repeat(Number(n[1]))
  )

const sort = (blocks: string) => {
  while (blocks.match(/\.[^.]/)) {
    const firstDotIndex = blocks.indexOf('.')
    const lastDigitIndex = blocks.split('')
      .reverse()
      .findIndex((char) => /[^.]/.test(char))
    const lastDigit = blocks[blocks.length - 1 - lastDigitIndex]

    blocks = blocks.substring(0, firstDotIndex) +
      lastDigit +
      blocks.substring(
        firstDotIndex + 1,
        blocks.length - 1 - lastDigitIndex,
      ) +
      '.' +
      blocks.substring(blocks.length - lastDigitIndex)
  }
  return blocks
}

const sortWithoutFrag = (blocks: string): string => {
  const symbolBlocks = [...blocks.matchAll(/([^.])\1*/g)].reverse()

  for (const match of symbolBlocks) {
    const block = match[0]
    const blockLength = block.length
    const dotPattern = new RegExp(`\\.{${blockLength},}`)
    const dotMatch = blocks.match(dotPattern)

    if (dotMatch) {
      const dotIndex = dotMatch.index!
      const oldIndex = blocks.lastIndexOf(block)

      if (oldIndex > dotIndex) {
        // We only move to the left
        blocks = blocks.slice(0, dotIndex) +
          block +
          blocks.slice(dotIndex + blockLength, oldIndex) +
          '.'.repeat(blockLength) +
          blocks.slice(oldIndex + blockLength)
      }
    }
  }
  return blocks
}

const computeTotal = (blocks: string) => {
  return blocks
    // don't count dots but keep their index
    .replaceAll('.', '0')
    .split('')
    // don't forget to remove 48 to get the actual value back
    .map((c) => c.codePointAt(0)! - 48)
    .reduce((sum, num, index) => sum + num * index, 0)
}

console.log(computeTotal(sort(ordered)))
console.log(computeTotal(sortWithoutFrag(ordered)))
