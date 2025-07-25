import { Grid, isFillable } from '@/grid'
import { KickTable, PIECE, Position, ROTATE, ROTATES, ROTATION, Shape } from './types'

// Piece shapes in each rotation state
const PIECE_SHAPES: Record<PIECE, Shape> = {
  I: {
    [ROTATION.NORTH]: [[-1, 0], [0, 0], [1, 0], [2, 0]],
    [ROTATION.EAST]: [[1, -2], [1, -1], [1, 0], [1, 1]],
    [ROTATION.SOUTH]: [[-1, -1], [0, -1], [1, -1], [2, -1]],
    [ROTATION.WEST]: [[0, -2], [0, -1], [0, 0], [0, 1]],
  },
  O: {
    [ROTATION.NORTH]: [[0, 0], [1, 0], [0, 1], [1, 1]],
    [ROTATION.EAST]: [[0, 0], [1, 0], [0, 1], [1, 1]],
    [ROTATION.SOUTH]: [[0, 0], [1, 0], [0, 1], [1, 1]],
    [ROTATION.WEST]: [[0, 0], [1, 0], [0, 1], [1, 1]],
  },
  T: {
    [ROTATION.NORTH]: [[-1, 0], [0, 0], [1, 0], [0, 1]],
    [ROTATION.EAST]: [[0, -1], [0, 0], [1, 0], [0, 1]],
    [ROTATION.SOUTH]: [[0, -1], [-1, 0], [0, 0], [1, 0]],
    [ROTATION.WEST]: [[0, -1], [-1, 0], [0, 0], [0, 1]],
  },
  S: {
    [ROTATION.NORTH]: [[-1, 0], [0, 0], [0, 1], [1, 1]],
    [ROTATION.EAST]: [[1, -1], [1, 0], [0, 0], [0, 1]],
    [ROTATION.SOUTH]: [[-1, -1], [0, -1], [0, 0], [1, 0]],
    [ROTATION.WEST]: [[0, -1], [0, 0], [-1, 0], [-1, 1]],
  },
  Z: {
    [ROTATION.NORTH]: [[-1, 1], [0, 1], [0, 0], [1, 0]],
    [ROTATION.EAST]: [[0, -1], [0, 0], [1, 0], [1, 1]],
    [ROTATION.SOUTH]: [[-1, 0], [0, 0], [0, -1], [1, -1]],
    [ROTATION.WEST]: [[-1, -1], [-1, 0], [0, 0], [0, 1]],
  },
  J: {
    [ROTATION.NORTH]: [[-1, 1], [-1, 0], [0, 0], [1, 0]],
    [ROTATION.EAST]: [[0, -1], [0, 0], [0, 1], [1, 1]],
    [ROTATION.SOUTH]: [[-1, 0], [0, 0], [1, 0], [1, -1]],
    [ROTATION.WEST]: [[-1, -1], [0, -1], [0, 0], [0, 1]],
  },
  L: {
    [ROTATION.NORTH]: [[-1, 0], [0, 0], [1, 0], [1, 1]],
    [ROTATION.EAST]: [[1, -1], [0, -1], [0, 0], [0, 1]],
    [ROTATION.SOUTH]: [[-1, -1], [-1, 0], [0, 0], [1, 0]],
    [ROTATION.WEST]: [[0, -1], [0, 0], [0, 1], [-1, 1]],
  },
}

// SRS kick table for most pieces (not I or O)
const SRSPLUS_KICKS: KickTable = {
  [ROTATION.NORTH]: {
    [ROTATION.NORTH]: [],
    [ROTATION.EAST]: [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    [ROTATION.SOUTH]: [[0, 0], [0, 1], [1, 1], [-1, 1], [1, 0], [-1, 0]],
    [ROTATION.WEST]: [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  },
  [ROTATION.EAST]: {
    [ROTATION.NORTH]: [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    [ROTATION.EAST]: [],
    [ROTATION.SOUTH]: [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    [ROTATION.WEST]: [[0, 0], [1, 0], [1, 2], [1, 1], [0, 2], [0, 1]],
  },
  [ROTATION.SOUTH]: {
    [ROTATION.NORTH]: [[0, 0], [0, -1], [-1, -1], [1, -1], [-1, 0], [1, 0]],
    [ROTATION.EAST]: [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    [ROTATION.SOUTH]: [],
    [ROTATION.WEST]: [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  },
  [ROTATION.WEST]: {
    [ROTATION.NORTH]: [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
    [ROTATION.EAST]: [[0, 0], [-1, 0], [-1, -2], [-1, -1], [0, -2], [0, -1]],
    [ROTATION.SOUTH]: [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
    [ROTATION.WEST]: [],
  },
}

// SRS kick table for I piece
const SRSPLUS_I_KICKS: KickTable = {
  [ROTATION.NORTH]: {
    [ROTATION.NORTH]: [],
    [ROTATION.EAST]: [[0, 0], [1, 0], [-2, 0], [-2, -1], [1, 2]],
    [ROTATION.SOUTH]: [[0, 0]],
    [ROTATION.WEST]: [[0, 0], [-1, 0], [2, 0], [2, -1], [-1, 2]],
  },
  [ROTATION.EAST]: {
    [ROTATION.NORTH]: [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
    [ROTATION.EAST]: [],
    [ROTATION.SOUTH]: [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
    [ROTATION.WEST]: [[0, 0]],
  },
  [ROTATION.SOUTH]: {
    [ROTATION.NORTH]: [[0, 0]],
    [ROTATION.EAST]: [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
    [ROTATION.SOUTH]: [],
    [ROTATION.WEST]: [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  },
  [ROTATION.WEST]: {
    [ROTATION.NORTH]: [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
    [ROTATION.EAST]: [[0, 0]],
    [ROTATION.SOUTH]: [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
    [ROTATION.WEST]: [],
  },
}

// SRS kick table for O piece
const SRSPLUS_O_KICKS: KickTable = {
  [ROTATION.NORTH]: {
    [ROTATION.NORTH]: [],
    [ROTATION.EAST]: [[0, 0]],
    [ROTATION.SOUTH]: [[0, 0]],
    [ROTATION.WEST]: [[0, 0]],
  },
  [ROTATION.EAST]: {
    [ROTATION.NORTH]: [[0, 0]],
    [ROTATION.EAST]: [],
    [ROTATION.SOUTH]: [[0, 0]],
    [ROTATION.WEST]: [[0, 0]],
  },
  [ROTATION.SOUTH]: {
    [ROTATION.NORTH]: [[0, 0]],
    [ROTATION.EAST]: [[0, 0]],
    [ROTATION.SOUTH]: [],
    [ROTATION.WEST]: [[0, 0]],
  },
  [ROTATION.WEST]: {
    [ROTATION.NORTH]: [[0, 0]],
    [ROTATION.EAST]: [[0, 0]],
    [ROTATION.SOUTH]: [[0, 0]],
    [ROTATION.WEST]: [],
  },
}

const SRSPLUS: Record<PIECE, KickTable> = {
  I: SRSPLUS_I_KICKS,
  J: SRSPLUS_KICKS,
  L: SRSPLUS_KICKS,
  O: SRSPLUS_O_KICKS,
  S: SRSPLUS_KICKS,
  Z: SRSPLUS_KICKS,
  T: SRSPLUS_KICKS,
}

export const getNextRotation = (
  current: ROTATION,
  rotate: Exclude<ROTATE, ROTATE.NOOP>,
): ROTATION => {
  if (current === ROTATION.NORTH) {
    switch (rotate) {
      case ROTATE.CLOCKWISE: return ROTATION.EAST
      case ROTATE.FLIP: return ROTATION.SOUTH
      case ROTATE.COUNTERCLOCKWISE: return ROTATION.WEST
    }
  } else if (current === ROTATION.EAST) {
    switch (rotate) {
      case ROTATE.CLOCKWISE: return ROTATION.SOUTH
      case ROTATE.FLIP: return ROTATION.WEST
      case ROTATE.COUNTERCLOCKWISE: return ROTATION.NORTH
    }
  } else if (current === ROTATION.SOUTH) {
    switch (rotate) {
      case ROTATE.CLOCKWISE: return ROTATION.WEST
      case ROTATE.FLIP: return ROTATION.NORTH
      case ROTATE.COUNTERCLOCKWISE: return ROTATION.EAST
    }
  } else if (current === ROTATION.WEST) {
    switch (rotate) {
      case ROTATE.CLOCKWISE: return ROTATION.NORTH
      case ROTATE.FLIP: return ROTATION.EAST
      case ROTATE.COUNTERCLOCKWISE: return ROTATION.SOUTH
    }
  }
  throw new Error(`Invalid rotation: ${current} with rotate: ${rotate}`)
}

export const getPiecePositions = (
  piece: PIECE,
  rotation: ROTATES,
  x: number,
  y: number,
): Position[] => {
  return PIECE_SHAPES[piece][rotation].map(([dx, dy]) => [x + dx, y + dy])
}

export const kickTest = (
  grid: Grid,
  piece: PIECE,
  fromPosition: Position,
  fromRotation: ROTATES,
  toRotation: ROTATES,
): Position | null => {
  const [x, y] = fromPosition

  const kickTable = SRSPLUS[piece]
  const kicks = kickTable[fromRotation][toRotation]
  for (const kick of kicks) {
    const [dx, dy] = kick
    const piecePositions = getPiecePositions(piece, toRotation, x + dx, y + dy)
    if (piecePositions.every(([px, py]) => isFillable(grid, px, py))) return [x + dx, y + dy]
  }
  return null // Rotation cancelled
}
