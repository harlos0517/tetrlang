import { Board, GARBAGE, PIECE } from './types'

export type Cell = PIECE | GARBAGE | null
type GridRow = Cell[]
export type Grid = GridRow[]

export const GRID_WIDTH = 10
const GRID_HEIGHT = 40
export const DISPLAY_HEIGHT = 20 // Visible rows in the grid

const createGrid = (): Grid =>
  Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null as Cell) as GridRow)

export const boardToGrid = (board: Board): Grid => {
  const grid = createGrid()

  for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
    if (rowIndex >= GRID_HEIGHT) break // Prevent overflow

    for (let col = 0; col < GRID_WIDTH; col++) {
      // If hole (false), keep as null, otherwise mark as garbage
      grid[rowIndex][col] = board[rowIndex][col] ? GARBAGE : null
    }
  }

  return grid
}

export const isFillable = (grid: Grid, x: number, y: number): boolean =>
  x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT && grid[y][x] === null

export const clearLines = (grid: Grid): { grid: Grid, clearedLines: number[] } => {
  const newGrid: Grid = []
  const clearedLines: number[] = []

  for (const [index, row] of grid.entries()) {
    if (row.every(cell => cell !== null)) clearedLines.push(index)
    else newGrid.push([...row])
  }

  while (newGrid.length < GRID_HEIGHT)
    newGrid.push(Array(GRID_WIDTH).fill(null))

  return { grid: newGrid, clearedLines }
}
