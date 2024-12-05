const file = await Deno.open('input')

const mulRegex = /mul\((\d{1,3}),(\d{1,3})\)/g
const doRegex = /(?:^|do\(\)).*?(?:don't\(\)|$)/g

let total = 0
let newTotal = 0

for await (
  const line of file.readable
    .pipeThrough(new TextDecoderStream())
) {
  // Big string, don't split in lines
  const cleanLine = line.replaceAll('\n', '')

  cleanLine.matchAll(mulRegex).forEach((m) => {
    total += Number(m[1]) * Number(m[2])
  })

  cleanLine.matchAll(doRegex).forEach((doing) => {
    doing[0].matchAll(mulRegex).forEach((m) => {
      newTotal += Number(m[1]) * Number(m[2])
    })
  })
}

console.log(total)
console.log(newTotal)
