import { TextLineStream } from 'jsr:@std/streams/text-line-stream'

type Grid = string[][]
type Position = [number, number]
type Plot = Position[]

const grid: Grid = []
const file = await Deno.open('input')
const directions: Position[] = [[0, 1], [0, -1], [1, 0], [-1, 0]]
const diagonals: Position[] = [[1, 1], [1, -1], [-1, 1], [-1, -1]]

for await (
  const line of file.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream())
) {
  grid.push(line.split(''))
}

const oob = (row: number, col: number) =>
  row < 0 || row >= grid.length || col < 0 || col >= grid[0].length

const plots = new Map<string, Plot[]>()
const visited = new Set<string>()

// Depth first search
const search = (
  row: number,
  col: number,
  plant: string,
  currentPlot: Plot,
) => {
  if (
    oob(row, col) || grid[row][col] !== plant || visited.has(`${row}_${col}`)
  ) return

  visited.add(`${row}_${col}`)
  currentPlot.push([row, col])

  directions.forEach(([dx, dy]) =>
    search(row + dx, col + dy, plant, currentPlot)
  )
}

for (let row = 0; row < grid.length; row++) {
  for (let col = 0; col < grid[0].length; col++) {
    if (!visited.has(`${row}_${col}`)) {
      const plant = grid[row][col]
      const newPlot: Plot = []
      search(row, col, plant, newPlot)
      plots.set(plant, [...(plots.get(plant) || []), newPlot])
    }
  }
}

const areaAndPerimeter = (plot: Plot): [number, number] => {
  let perimeter = 0
  for (const [row, col] of plot) {
    perimeter += directions.filter(([dx, dy]) => {
      const [newRow, newCol] = [row + dx, col + dy]
      return oob(newRow, newCol) || grid[newRow][newCol] !== grid[row][col]
    }).length
  }

  return [plot.length, perimeter]
}

const areaAndSides = (plot: Plot): [number, number] => {
  const plotSet = new Set(plot.map(([row, col]) => `${row}_${col}`))
  // Side count is the same of corner count
  let corners = 0

  for (const [row, col] of plot) {
    for (const [dx, dy] of diagonals) {
      const diagonalRow = row + dx
      const diagonalCol = col + dy

      const neighborCol = `${row}_${diagonalCol}`
      const neighborRow = `${diagonalRow}_${col}`

      if (plotSet.has(`${diagonalRow}_${diagonalCol}`)) {
        // Diagonal is inside the plot
        // Corner if both neighbors are not in the plot
        if (!plotSet.has(neighborCol) && !plotSet.has(neighborRow)) {
          corners++
        }
      } else {
        // Diagonal is outside the plot
        // Corner if both neighbors are either inside or outside the plot
        if (plotSet.has(neighborCol) === plotSet.has(neighborRow)) {
          corners++
        }
      }
    }
  }

  return [plot.length, corners]
}

console.log(
  Array.from(plots.values())
    .flatMap((plotList) =>
      plotList.map((positions) => areaAndPerimeter(positions))
    )
    .reduce((sum, [area, perimeter]) => sum + area * perimeter, 0),
)

console.log(
  Array.from(plots.values())
    .flatMap((plotList) => plotList.map((positions) => areaAndSides(positions)))
    .reduce((sum, [area, perimeter]) => sum + area * perimeter, 0),
)
