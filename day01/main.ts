import { TextLineStream } from 'jsr:@std/streams/text-line-stream'

const file = await Deno.open('input')
const left: number[] = []
const right: number[] = []

for await (
  const line of file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream())
) {
  const [l, r] = line.trim().split(/\s+/).map(Number)
  left.push(l)
  right.push(r)
}

left.sort((a, b) => a - b)
right.sort((a, b) => a - b)

const total = left.reduce(
  (sum, num, index) => sum + Math.abs(num - right[index]),
  0,
)

console.log(total)

// ----

const similarity = left.reduce((acc, num) => {
  const count = right.filter((r) => r === num).length
  return acc + count * num
}, 0)

console.log(similarity)
