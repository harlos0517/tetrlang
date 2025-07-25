import { TetrisState, TetrisStateData } from '@/tetris'
import { Canvas, createCanvas, CanvasRenderingContext2D as CTX, registerFont } from 'canvas'
import { Cell, DISPLAY_HEIGHT, GRID_WIDTH } from './grid'
import { getPiecePositions } from './srs'
import { GARBAGE, HOLD, KEY, KEYS, LOCK, MOVE, PIECE, Position, ROTATE, ROTATION } from './types'

registerFont('./src/hun2.ttf', { family: 'hun' })

export const CELL_SIZE = 32
export const CELL_BORDER = 1
export const GRID_GAP = CELL_BORDER * 2
export const LINE_WIDTH = 4
export const BOARD_PADDING = 0 // Padding inset of the board
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

export const delayMap: Record<TetrisStateData['operation'], number> = {
  [MOVE.FALL]: 1,
  [MOVE.LEFT]: 1,
  [MOVE.RIGHT]: 1,
  [MOVE.SOFTDROP]: 0,
  [MOVE.LEFTSIDE]: 0,
  [MOVE.RIGHTSIDE]: 0,
  [ROTATE.CLOCKWISE]: 1,
  [ROTATE.COUNTERCLOCKWISE]: 1,
  [ROTATE.FLIP]: 1,
  [ROTATE.NOOP]: 1,
  [LOCK]: 2,
  [HOLD]: 1,
  'spawn': 1,
  'init': 3,
}

export const delayMapWithStep: Record<TetrisStateData['operation'], number> = {
  [MOVE.FALL]: 1,
  [MOVE.LEFT]: 1,
  [MOVE.RIGHT]: 1,
  [MOVE.SOFTDROP]: 0.01,
  [MOVE.LEFTSIDE]: 0.01,
  [MOVE.RIGHTSIDE]: 0.01,
  [ROTATE.CLOCKWISE]: 1,
  [ROTATE.COUNTERCLOCKWISE]: 1,
  [ROTATE.FLIP]: 1,
  [ROTATE.NOOP]: 1,
  [LOCK]: 2,
  [HOLD]: 1,
  'spawn': 1,
  'init': 3,
}

export const LINES_MAP: Record<number, string> = {
  1: 'SINGLE',
  2: 'DOUBLE',
  3: 'TRIPLE',
  4: 'QUAD',
}

export const END_DELAY_MAP = 3
export const KEY_PRESS_RATIO = 0.4

export const createFrames = (state: TetrisState, withStep = false) => {
  const { canvas, ctx } = createRenderer()
  init(ctx)

  // Render board
  renderGrid(ctx, state.grid)

  // Render ghost piece
  if (state.piece) renderGhostPiece(ctx, state)

  // Render current piece
  if (state.piece) renderCurrentPiece(ctx, state)

  // render clearing lines
  if (state.clearingLines) renderClearingLines(ctx, state.clearingLines)

  // Render hold piece
  if (state.hold) renderHoldPiece(ctx, state.hold, state.canHold)

  // Render next pieces
  renderNextPieces(ctx, state.next)

  // Render spin text
  renderSpinText(
    ctx,
    state.spinned,
    state.spin,
    state.clearingLines || [],
  )

  const shouldDuplicate = state.key && state.keyUp
  const ratio = (withStep ? delayMapWithStep : delayMap)[state.operation]
  const canvas2 = createCanvas(CANVAS_SIZE.WIDTH, CANVAS_SIZE.HEIGHT)
  const ctx2 = canvas2.getContext('2d')
  ctx2.drawImage(canvas, 0, 0)

  renderKey(ctx, state.key)
  if (shouldDuplicate) {
    renderKey(ctx2, null)
    return [
      { canvas, ctx, delayRatio: KEY_PRESS_RATIO * ratio },
      { canvas: canvas2, ctx: ctx2, delayRatio: (1 - KEY_PRESS_RATIO) * ratio },
    ]
  } else return [{ canvas, ctx, delayRatio: ratio }]
}

const p = (x: number, y: number, offsetX = 0, offsetY = 0): [number, number] => ([
  x * CELL_SIZE + PADDING.LEFT * CELL_SIZE + offsetX,
  CANVAS_SIZE.HEIGHT - y * CELL_SIZE - PADDING.BOTTOM * CELL_SIZE - offsetY,
])

const c = (x: number, y: number): [number, number, number, number] => ([
  x * CELL_SIZE + PADDING.LEFT * CELL_SIZE + CELL_BORDER,
  CANVAS_SIZE.HEIGHT - y * CELL_SIZE - PADDING.BOTTOM * CELL_SIZE - CELL_BORDER,
  CELL_SIZE - GRID_GAP,
  -CELL_SIZE + GRID_GAP,
])

const l = (y: number): [number, number, number, number] => ([
  0 * CELL_SIZE + PADDING.LEFT * CELL_SIZE + CELL_BORDER,
  CANVAS_SIZE.HEIGHT - y * CELL_SIZE - PADDING.BOTTOM * CELL_SIZE - CELL_BORDER,
  CELL_SIZE * 10 - GRID_GAP,
  -CELL_SIZE + GRID_GAP,
])

const b = (x: number, y: number, w: number, h: number): [number, number, number, number] => ([
  x * CELL_SIZE + PADDING.LEFT * CELL_SIZE + CELL_BORDER,
  CANVAS_SIZE.HEIGHT - y * CELL_SIZE - PADDING.BOTTOM * CELL_SIZE - CELL_BORDER,
  w * CELL_SIZE - GRID_GAP,
  -h * CELL_SIZE + GRID_GAP,
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

  // Draw checkered background
  for (let y = 0; y < DISPLAY_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if ((x + y) % 2 === 0) ctx.fillStyle = '#111111'
      else ctx.fillStyle = '#222222'
      ctx.fillRect(...c(x, y))
    }
  }

  // Draw grid border
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = LINE_WIDTH
  const offset = LINE_WIDTH / 2 - CELL_BORDER + BOARD_PADDING
  ctx.beginPath()
  ctx.moveTo(...p(0, DISPLAY_HEIGHT, -offset, -CELL_BORDER))
  ctx.lineTo(...p(0, 0, -offset, -offset))
  ctx.lineTo(...p(GRID_WIDTH, 0, offset, -offset))
  ctx.lineTo(...p(GRID_WIDTH, DISPLAY_HEIGHT, offset, -CELL_BORDER))
  ctx.stroke()

}

const renderGrid = (ctx: CTX, grid: Cell[][]): void => {
  for (let y = 0; y < DISPLAY_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const cell = grid[y]?.[x]
      if (!cell) continue
      ctx.fillStyle = PIECE_COLORS[cell]
      ctx.fillRect(...c(x, y))
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
    ctx.fillRect(...c(x, y))
  }
}

const renderGhostPiece = (ctx: CTX, state: TetrisState): void => {
  if (!state.piece) return
  const ghostPosition = state.ghostPiecePosition
  if (!ghostPosition) return

  const positions = getPiecePositions(
    state.piece,
    state.rotation,
    ...ghostPosition,
  )

  for (const [x, y] of positions) {
    ctx.strokeStyle = PIECE_COLORS[state.piece]
    renderBlockBorder(ctx, x, y, 1, 1, 2)
  }
}

const renderClearingLines = (ctx: CTX, clearingLines: number[]): void => {
  ctx.fillStyle = '#FFFFFF'
  for (const line of clearingLines) ctx.fillRect(...l(line))
}

const renderHoldPiece = (ctx: CTX, holdPiece: PIECE | null, canHold = true): void => {
  if (!holdPiece) return

  // Render hold piece in left side area
  const holdPosition = [-4, 17]

  const positions = getPiecePositions(holdPiece, ROTATION.NORTH, 0, 0)
  for (const [dx, dy] of positions) {
    const position = [holdPosition[0] + dx, holdPosition[1] + dy] as Position
    ctx.fillStyle = canHold ? PIECE_COLORS[holdPiece] : '#555555'
    ctx.fillRect(...c(...position))
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
      ctx.fillRect(...c(x, y))
    }

    nextY -= dist
  }
}

const renderBlockBorder = (
  ctx: CTX,
  _x: number,
  _y: number,
  _w: number,
  _h: number,
  border: number,
) => {
  const [x, y, w, h] = b(_x, _y, _w, _h)
  const offset = border / 2
  ctx.lineWidth = border
  ctx.beginPath()
  ctx.moveTo(x + offset, y - offset)
  ctx.lineTo(x + w - offset, y - offset)
  ctx.lineTo(x + w - offset, y + h + offset)
  ctx.lineTo(x + offset, y + h + offset)
  ctx.closePath()
  ctx.stroke()
}

const renderKeyIcon = (ctx: CTX, key: KEYS, x: number, y: number) => {
  const GAP = CELL_SIZE / 8
  const pos = [x, y]

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = GAP
  const _ = (_x: number, _y: number) => [pos[0] + GAP * _x, pos[1] - GAP * _y] as const

  switch (key) {
    case KEY.SHIFT:
      ctx.beginPath()
      ctx.moveTo(..._(-4, 1))
      ctx.lineTo(..._(4, 1))
      ctx.lineTo(..._(2, 3))
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(..._(4, -1))
      ctx.lineTo(..._(-4, -1))
      ctx.lineTo(..._(-2, -3))
      ctx.stroke()
      break
    case KEY.A:
      ctx.beginPath()
      ctx.moveTo(..._(-2, -4))
      ctx.lineTo(..._(-2, 2))
      ctx.arcTo(..._(-2, 4), ..._(0, 4), GAP * 2)
      ctx.arcTo(..._(2, 4), ..._(2, 2), GAP * 2)
      ctx.lineTo(..._(2, -4))
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(..._(4, -2))
      ctx.lineTo(..._(2, -4))
      ctx.lineTo(..._(0, -2))
      ctx.stroke()
      break
    case KEY.Z:
      ctx.beginPath()
      ctx.moveTo(..._(0, -3))
      ctx.arcTo(..._(3, -3), ..._(3, 0), GAP * 3)
      ctx.arcTo(..._(3, 3), ..._(0, 3), GAP * 3)
      ctx.arcTo(..._(-3, 3), ..._(-3, 0), GAP * 3)
      ctx.lineTo(..._(-3, -2))
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(..._(-5, 0))
      ctx.lineTo(..._(-3, -2))
      ctx.lineTo(..._(-1, 0))
      ctx.stroke()
      break
    case KEY.UP:
      ctx.beginPath()
      ctx.moveTo(..._(0, -3))
      ctx.arcTo(..._(-3, -3), ..._(-3, 0), GAP * 3)
      ctx.arcTo(..._(-3, 3), ..._(0, 3), GAP * 3)
      ctx.arcTo(..._(3, 3), ..._(3, 0), GAP * 3)
      ctx.lineTo(..._(3, -2))
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(..._(5, 0))
      ctx.lineTo(..._(3, -2))
      ctx.lineTo(..._(1, 0))
      ctx.stroke()
      break
    case KEY.LEFT:
      ctx.beginPath()
      ctx.moveTo(..._(4, 0))
      ctx.lineTo(..._(-4, 0))
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(..._(-2, 2))
      ctx.lineTo(..._(-4, 0))
      ctx.lineTo(..._(-2, -2))
      ctx.stroke()
      break
    case KEY.RIGHT:
      ctx.beginPath()
      ctx.moveTo(..._(-4, 0))
      ctx.lineTo(..._(4, 0))
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(..._(2, 2))
      ctx.lineTo(..._(4, 0))
      ctx.lineTo(..._(2, -2))
      ctx.stroke()
      break
    case KEY.SPACE:
      ctx.beginPath()
      ctx.moveTo(..._(0, 4))
      ctx.lineTo(..._(0, -2))
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(..._(-2, 0))
      ctx.lineTo(..._(0, -2))
      ctx.lineTo(..._(2, 0))
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(..._(-2, -4))
      ctx.lineTo(..._(2, -4))
      ctx.stroke()
      break
    case KEY.DOWN:
      ctx.beginPath()
      ctx.moveTo(..._(0, 4))
      ctx.lineTo(..._(0, -4))
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(..._(-2, -2))
      ctx.lineTo(..._(0, -4))
      ctx.lineTo(..._(2, -2))
      ctx.stroke()
      break
    default: return
  }
}

const KeyMap: Record<KEYS, { x: number, y: number }> = {
  [KEY.SHIFT]: { x: -5, y: 13 },
  [KEY.A]: { x: -3, y: 13 },
  [KEY.Z]: { x: -5, y: 11 },
  [KEY.UP]: { x: -3, y: 11 },
  [KEY.LEFT]: { x: -5, y: 9 },
  [KEY.RIGHT]: { x: -3, y: 9 },
  [KEY.SPACE]: { x: -5, y: 7 },
  [KEY.DOWN]: { x: -3, y: 7 },
}

const renderKey = (ctx: CTX, key: KEY | null) => {
  const BLOCK_BORDER = 2
  ctx.strokeStyle = '#FFFFFF'
  ctx.fillStyle = '#FFFFFF'

  KEYS.map(k => {
    const pos = KeyMap[k]
    if (k === key) ctx.fillRect(...b(pos.x, pos.y, 2, 2))
    else renderBlockBorder(ctx, pos.x, pos.y, 2, 2, BLOCK_BORDER)
  })

  KEYS.map(k => {
    const pos = KeyMap[k]
    if (k === key) ctx.strokeStyle = '#000000'
    else ctx.strokeStyle = '#FFFFFF'
    renderKeyIcon(ctx, k, ...p(pos.x + 1, pos.y + 1))
  })
}

const renderSpinText = (
  ctx: CTX,
  piece: PIECE | null,
  spin: boolean | 'mini' | null,
  clearingLines: number[],
) => {
  const accent = clearingLines.length > 0

  ctx.textAlign = 'right'
  ctx.textAlign = 'center'

  if (accent && !spin) {
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 24px hun'
    ctx.fillText(LINES_MAP[clearingLines.length], ...p(-3, 4.2))
    return
  }

  if (!piece || !spin) return

  if (accent) {
    ctx.fillStyle = PIECE_COLORS[piece]
    ctx.fillRect(...b(-5, 4, 4, 2))
  }

  ctx.fillStyle = accent ? '#000000' : PIECE_COLORS[piece]
  ctx.textAlign = 'right'
  ctx.textAlign = 'center'
  ctx.font = 'bold 36px hun'
  const text = `${piece}-SPIN`
  ctx.fillText(text, ...p(-3, 5))

  if (accent) {
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 24px hun'
    ctx.fillText(LINES_MAP[clearingLines.length], ...p(-3, 4.2))
  }

  if (spin === 'mini') {
    ctx.fillStyle = PIECE_COLORS[piece]
    ctx.font = 'bold 16px hun'
    ctx.fillText('MINI', ...p(-3, 6.2))
  }
}
