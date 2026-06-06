import { CANVAS_SIZE, CELL_BORDER, CELL_SIZE, GRID_GAP, PADDING } from './constants'

export const point = (
  x: number,
  y: number,
  offsetX = 0,
  offsetY = 0,
): { x: number, y: number } => ({
  x: x * CELL_SIZE + PADDING.LEFT * CELL_SIZE + offsetX,
  y: CANVAS_SIZE.HEIGHT - y * CELL_SIZE - PADDING.BOTTOM * CELL_SIZE - offsetY,
})

export const cell = (x: number, y: number): {
  x: number
  y: number
  width: number
  height: number
} => ({
  x: x * CELL_SIZE + PADDING.LEFT * CELL_SIZE + CELL_BORDER,
  y: CANVAS_SIZE.HEIGHT - (y + 1) * CELL_SIZE - PADDING.BOTTOM * CELL_SIZE - CELL_BORDER + GRID_GAP,
  width: CELL_SIZE - GRID_GAP,
  height: CELL_SIZE - GRID_GAP,
})

export const box = (x: number, y: number, w: number, h: number): {
  x: number
  y: number
  width: number
  height: number
} => ({
  x: x * CELL_SIZE + PADDING.LEFT * CELL_SIZE + CELL_BORDER,
  y: CANVAS_SIZE.HEIGHT - (y + h) * CELL_SIZE - PADDING.BOTTOM * CELL_SIZE - CELL_BORDER + GRID_GAP,
  width: w * CELL_SIZE - GRID_GAP,
  height: h * CELL_SIZE - GRID_GAP,
})
