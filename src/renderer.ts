import { TetrisState } from '@/tetris'
import { createCanvas, CanvasRenderingContext2D as CTX, registerFont } from 'canvas'
import { Cell, DISPLAY_HEIGHT, GRID_WIDTH } from './grid'
import { getPiecePositions } from './srs'
import { GARBAGE, KEY, KEYS, PIECE, Position, ROTATION } from './types'

registerFont('./src/hun2.ttf', { family: 'hun' })

const CELL_SIZE = 16
const CELL_BORDER = CELL_SIZE / 16
const GRID_GAP = CELL_BORDER * 2
const LINE_WIDTH = CELL_SIZE / 8
const BOARD_PADDING = 0 // Padding inset of the board
const PADDING = {
  TOP: 4,
  BOTTOM: 2,
  LEFT: 6,
  RIGHT: 6,
}

const MAX_NEXT_PIECES = 5 // Maximum number of next pieces to display

const CANVAS_SIZE = {
  WIDTH: (GRID_WIDTH + PADDING.LEFT + PADDING.RIGHT) * CELL_SIZE,
  HEIGHT: (DISPLAY_HEIGHT + PADDING.TOP + PADDING.BOTTOM) * CELL_SIZE,
}

const PIECE_COLORS: Record<PIECE | GARBAGE, string> = {
  I: '#00FFFF',
  J: '#0040FF',
  L: '#FF8000',
  O: '#FFDD00',
  S: '#00CC00',
  Z: '#FF0000',
  T: '#FF00FF',
  G: '#808080',
}

const LINES_MAP: Record<number, string> = {
  1: 'SINGLE',
  2: 'DOUBLE',
  3: 'TRIPLE',
  4: 'QUAD',
}

export const createFrame = (state: TetrisState) => {
  const canvas = createCanvas(CANVAS_SIZE.WIDTH, CANVAS_SIZE.HEIGHT)
  const ctx = canvas.getContext('2d')
  init(ctx)

  renderGrid(ctx, state.grid)
  if (state.piece) renderGhostPiece(ctx, state)
  if (state.piece) renderCurrentPiece(ctx, state)
  if (state.clearingLines) renderClearingLines(ctx, state.clearingLines)
  if (state.hold) renderHoldPiece(ctx, state.hold, state.canHold)
  renderNextPieces(ctx, state.next)
  renderSpinText(
    ctx,
    state.spinned,
    state.spin,
    state.clearingLines || [],
  )
  renderKey(ctx, state.key)
  if (state.combo > 1) renderComboText(ctx, state.combo)
  if (state.b2b > 1) renderB2BText(ctx, state.b2b)
  if (state.perfectClear()) renderPerfectClearText(ctx)
  return canvas
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

  ctx.fillStyle = '#FFFFFF'
  ctx.font = `bold ${CELL_SIZE}px hun`
  ctx.textAlign = 'center'
  ctx.fillText('TETR\nLANG', ...p(-3, 22))

  ctx.fillStyle = '#888888'
  ctx.font = `bold ${CELL_SIZE * 0.75}px hun`
  ctx.textAlign = 'center'
  ctx.fillText('MADE BY\n HARLOS', ...p(13, 22))
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
    renderBlockBorder(ctx, x, y, 1, 1, CELL_SIZE / 8)
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
  [KEY.SHIFT]: { x: -5, y: 14 },
  [KEY.A]: { x: -3, y: 14 },
  [KEY.Z]: { x: -5, y: 12 },
  [KEY.UP]: { x: -3, y: 12 },
  [KEY.LEFT]: { x: -5, y: 10 },
  [KEY.RIGHT]: { x: -3, y: 10 },
  [KEY.SPACE]: { x: -5, y: 8 },
  [KEY.DOWN]: { x: -3, y: 8 },
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
    ctx.font = `bold ${CELL_SIZE * 0.75}px hun`
    ctx.fillText(LINES_MAP[clearingLines.length], ...p(-3, 5))
    return
  }

  if (!piece || !spin) return

  if (accent) {
    ctx.fillStyle = PIECE_COLORS[piece]
    ctx.fillRect(...b(-5, 4.8, 4, 2))
  }

  ctx.fillStyle = accent ? '#000000' : PIECE_COLORS[piece]
  ctx.textAlign = 'right'
  ctx.textAlign = 'center'
  ctx.font = `bold ${CELL_SIZE * 1.12}px hun`
  const text = `${piece}-SPIN`
  ctx.fillText(text, ...p(-3, 5.8))

  if (accent) {
    ctx.fillStyle = '#000000'
    ctx.font = `bold ${CELL_SIZE * 0.75}px hun`
    ctx.fillText(LINES_MAP[clearingLines.length], ...p(-3, 5))
  }

  if (spin === 'mini') {
    ctx.fillStyle = PIECE_COLORS[piece]
    ctx.font = `bold ${CELL_SIZE * 0.75}px hun`
    ctx.fillText('MINI', ...p(-3, 7))
  }
}

const renderComboText = (ctx: CTX, combo: number) => {
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `bold ${CELL_SIZE * 0.75}px hun`
  ctx.textAlign = 'center'
  ctx.fillText(`${combo - 1} COMBO`, ...p(-3, 3.5))
}

const renderB2BText = (ctx: CTX, b2b: number) => {
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `bold ${CELL_SIZE * 0.75}px hun`
  ctx.textAlign = 'center'
  ctx.fillText(`B2B x ${b2b - 1}`, ...p(-3, 2))
}

const renderPerfectClearText = (ctx: CTX) => {
  ctx.fillStyle = '#FFBB00'
  ctx.font = `bold ${CELL_SIZE * 1.75}px hun`
  ctx.textAlign = 'center'
  ctx.fillText('PERFECT\n  CLEAR', ...p(5, 15))
}
