import {
  DISPLAY_HEIGHT,
  GARBAGE,
  GRID_WIDTH,
  HOLD,
  KEY,
  KEYS,
  LOCK,
  MOVE,
  PIECE,
  ROTATE,
  type TetrisStateData,
} from 'tetrlang-core'

export const CELL_SIZE = 16
export const CELL_BORDER = CELL_SIZE / 16
export const GRID_GAP = CELL_BORDER * 2
export const LINE_WIDTH = CELL_SIZE / 8
export const BOARD_PADDING = 0
export const PADDING = {
  TOP: 4,
  BOTTOM: 2,
  LEFT: 6,
  RIGHT: 6,
}

export const CANVAS_SIZE = {
  WIDTH: (GRID_WIDTH + PADDING.LEFT + PADDING.RIGHT) * CELL_SIZE,
  HEIGHT: (DISPLAY_HEIGHT + PADDING.TOP + PADDING.BOTTOM) * CELL_SIZE,
}

export const PIECE_COLORS: Record<PIECE | GARBAGE, string> = {
  I: '#00FFFF',
  J: '#0040FF',
  L: '#FF8000',
  O: '#FFDD00',
  S: '#00CC00',
  Z: '#FF0000',
  T: '#FF00FF',
  G: '#808080',
}
export const LINES_MAP: Record<number, string> = {
  1: 'SINGLE',
  2: 'DOUBLE',
  3: 'TRIPLE',
  4: 'QUAD',
}

export const KEY_MAP: Record<KEYS, { x: number, y: number }> = {
  [KEY.SHIFT]: { x: -5, y: 14 },
  [KEY.A]: { x: -3, y: 14 },
  [KEY.Z]: { x: -5, y: 12 },
  [KEY.UP]: { x: -3, y: 12 },
  [KEY.LEFT]: { x: -5, y: 10 },
  [KEY.RIGHT]: { x: -3, y: 10 },
  [KEY.SPACE]: { x: -5, y: 8 },
  [KEY.DOWN]: { x: -3, y: 8 },
}

export const FRAME_DELAY_MAP: Record<TetrisStateData['operation'], number> = {
  [MOVE.FALL]: 1,
  [MOVE.LEFT]: 1,
  [MOVE.RIGHT]: 1,
  [MOVE.SOFTDROP]: 0.1,
  [MOVE.LEFTSIDE]: 0.1,
  [MOVE.RIGHTSIDE]: 0.1,
  [ROTATE.CLOCKWISE]: 1,
  [ROTATE.COUNTERCLOCKWISE]: 1,
  [ROTATE.FLIP]: 1,
  [ROTATE.NOOP]: 1,
  [LOCK]: 3,
  [HOLD]: 1,
  'spawn': 1,
  'init': 3,
}

export const END_DELAY_RATIO = 3
