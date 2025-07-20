import { TetrisState } from '@/tetris'
import { Canvas, createCanvas, CanvasRenderingContext2D as CTX } from 'canvas'
import { Cell, DISPLAY_HEIGHT, GRID_WIDTH } from './grid'
import { getPiecePositions } from './srs'
import { GARBAGE, PIECE, Position, ROTATION } from './types'

export const CELL_SIZE = 32
export const CELL_BORDER = 4
export const GRID_GAP = CELL_BORDER * 2
export const PADDING = {
  TOP: 4,
  BOTTOM: 2,
  LEFT: 6,
  RIGHT: 6,
}

export const MAX_NEXT_PIECES = 5 // Maximum number of next pieces to display

export const CANVAS_SIZE = {
  WIDTH: (GRID_WIDTH + PADDING.LEFT + PADDING.RIGHT) * CELL_SIZE,
  HEIGHT: (DISPLAY_HEIGHT + PADDING.TOP + PADDING.BOTTOM) * CELL_SIZE,
}

export const PIECE_COLORS: Record<PIECE | GARBAGE, string> = {
  I: '#00FFFF',
  J: '#0000FF',
  L: '#FF8000',
  O: '#FFFF00',
  S: '#00FF00',
  Z: '#FF0000',
  T: '#800080',
  G: '#808080',
}

export const createFrame = (state: TetrisState) => {
  const { canvas, ctx } = createRenderer()
  init(ctx)

  // Render board
  renderGrid(ctx, state.grid)

  // Render current piece
  if (state.piece) renderCurrentPiece(ctx, state)

  // Render hold piece
  if (state.hold) renderHoldPiece(ctx, state.hold, state.canHold)

  // Render next pieces
  renderNextPieces(ctx, state.next)

  return { canvas, ctx }
}

const p = (x: number, y: number): [number, number] => ([
  x * CELL_SIZE + PADDING.LEFT * CELL_SIZE + CELL_BORDER,
  CANVAS_SIZE.HEIGHT - y * CELL_SIZE - PADDING.BOTTOM * CELL_SIZE - CELL_BORDER,
])

const r = (x: number, y: number): [number, number, number, number] => ([
  x * CELL_SIZE + PADDING.LEFT * CELL_SIZE + CELL_BORDER,
  CANVAS_SIZE.HEIGHT - y * CELL_SIZE - PADDING.BOTTOM * CELL_SIZE - CELL_BORDER,
  CELL_SIZE - CELL_BORDER,
  -CELL_SIZE + CELL_BORDER,
])

const createRenderer = (): { canvas: Canvas, ctx: CTX } => {
  const canvas = createCanvas(CANVAS_SIZE.WIDTH, CANVAS_SIZE.HEIGHT)
  const ctx = canvas.getContext('2d')

  return { canvas, ctx }
}

const init = (ctx: CTX): void => {
  // Clear canvas
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, CANVAS_SIZE.WIDTH, CANVAS_SIZE.HEIGHT)

  // Draw grid border
  ctx.strokeStyle = '#A0A0A0'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(...p(0, 0))
  ctx.lineTo(...p(GRID_WIDTH, 0))
  ctx.lineTo(...p(GRID_WIDTH, DISPLAY_HEIGHT))
  ctx.lineTo(...p(0, DISPLAY_HEIGHT))
  ctx.lineTo(...p(0, 0))
  ctx.closePath()
  ctx.stroke()

  // Draw checkered background
  for (let y = 0; y < DISPLAY_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if ((x + y) % 2 === 0) ctx.fillStyle = '#1A1A1A'
      else ctx.fillStyle = '#2A2A2A'
      ctx.fillRect(...r(x, y))
    }
  }
}

const renderGrid = (ctx: CTX, grid: Cell[][]): void => {
  for (let y = 0; y < DISPLAY_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const cell = grid[y]?.[x]
      if (!cell) continue
      ctx.fillStyle = PIECE_COLORS[cell]
      ctx.fillRect(...r(x, y))
    }
  }
}

const renderCurrentPiece = (ctx: CTX, state: TetrisState): void => {
  if (!state.piece) return

  const positions = getPiecePositions(
    state.piece,
    state.rotation,
    ...state.position,
  )

  for (const [x, y] of positions) {
    ctx.fillStyle = PIECE_COLORS[state.piece]
    ctx.fillRect(...r(x, y))
  }
}

const renderHoldPiece = (ctx: CTX, holdPiece: PIECE | null, canHold = true): void => {
  if (!holdPiece) return

  // Render hold piece in left side area
  const holdPosition = [-4, 17]

  const positions = getPiecePositions(holdPiece, ROTATION.NORTH, 0, 0)
  for (const [dx, dy] of positions) {
    const position = [holdPosition[0] + dx, holdPosition[1] + dy] as Position
    ctx.fillStyle = canHold ? PIECE_COLORS[holdPiece] : '#555555'
    ctx.fillRect(...r(...position))
  }
}

const renderNextPieces = (ctx: CTX, nextPieces: PIECE[]): void => {
  const nextX = 12
  let nextY = 17
  const dist = 4

  for (let i = 0; i < Math.min(nextPieces.length, MAX_NEXT_PIECES); i++) {
    const piece = nextPieces[i]
    const positions = getPiecePositions(piece, ROTATION.NORTH, 0, 0)

    for (const [dx, dy] of positions) {
      const x = nextX + dx
      const y = nextY + dy
      ctx.fillStyle = PIECE_COLORS[piece]
      ctx.fillRect(...r(x, y))
    }

    nextY -= dist
  }
}
