import { Grid, boardToGrid, clearLines, isFillable } from './grid'
import { getNextRotation, getPiecePositions, kickTest } from './srs'
import {
  Compiled,
  KEY,
  LOCK,
  MOVE,
  MOVES,
  PIECE,
  Position,
  ROTATE,
  ROTATES,
  ROTATION,
} from './types'

export interface TetrisState {
  grid: Grid
  piece: PIECE | null
  position: Position
  rotation: ROTATION
  hold: PIECE | null
  canHold: boolean
  next: PIECE[]
  key: KEY | null
  keyUp: boolean
}

export const generateStates = (data: Compiled): TetrisState[] => {
  const states: TetrisState[] = []
  const lastState = () => states[states.length - 1]

  try {
    const initialState = createInitialState(data)
    states.push(initialState)

    const spawnedState = dup(initialState)
    spawnedState.piece = spawnedState.next.shift() || null
    spawnedState.position = [4, 21]
    spawnedState.rotation = ROTATION.NORTH
    if (checkConflict(spawnedState)) throw new Error('gameover')
    states.push(spawnedState)

    for (const operation of data.operations) {
      if (operation.hold) states.push(holdPiece(lastState()))
      for (const op of operation.ops)
        states.push(...proceedWithOperations(lastState(), op))
      states.push(...lockPiece(lastState()))
    }
  } catch(error) {
    console.error(error)
  }

  console.log(states.length, 'states generated')
  return states
}

const createInitialState = (data: Compiled): TetrisState => ({
  grid: boardToGrid(data.board),
  piece: null,
  position: [4, 21] as Position,
  rotation: ROTATION.NORTH,
  hold: data.order?.holding || null,
  canHold: true,
  next: data.order?.next || data.operations.map(op => op.piece).filter(Boolean) as PIECE[],
  key: null,
  keyUp: true,
})

const dup = (state: TetrisState): TetrisState => {
  const newState: TetrisState = {
    ...state,
    key: state.keyUp ? null : state.key,
  }
  return JSON.parse(JSON.stringify(newState)) as TetrisState
}

const checkConflict = (state: TetrisState): boolean =>
  !!state.piece && !getPiecePositions(state.piece, state.rotation, ...state.position)
    .every(([x, y]) => isFillable(state.grid, x, y))

const proceedWithOperations = (
  state: TetrisState,
  operation: MOVES | ROTATES,
): TetrisState[] => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (MOVES.includes(operation as any))
    return movePiece(state, operation as MOVE)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  else if (ROTATES.includes(operation as any))
    return [rotatePiece(state, operation as ROTATE)]
  else throw new Error(`Unknown operation: ${operation}`)
}

const stepPiece = (
  oldState: TetrisState,
  move: MOVE.LEFT | MOVE.RIGHT | MOVE.FALL,
): TetrisState | null => {
  const state = dup(oldState)
  switch (move) {
    case MOVE.LEFT: state.position[0]--; break
    case MOVE.RIGHT: state.position[0]++; break
    case MOVE.FALL: state.position[1]--; break
  }
  return checkConflict(state) ? null : state
}

const movePiece = (
  oldState: TetrisState,
  move: MOVE | LOCK,
): TetrisState[] => {
  const state = dup(oldState)

  switch (move) {
    case MOVE.LEFT: state.key = KEY.LEFT; break
    case MOVE.RIGHT: state.key = KEY.RIGHT; break
    case MOVE.FALL: state.key = KEY.DOWN; break
    case MOVE.LEFTSIDE: state.key = KEY.LEFT; break
    case MOVE.RIGHTSIDE: state.key = KEY.RIGHT; break
    case MOVE.SOFTDROP: state.key = KEY.DOWN; break
    case LOCK: state.key = KEY.SPACE; break
  }
  if (!state.piece) {
    state.keyUp = true
    return [state]
  }

  if ([MOVE.LEFT, MOVE.RIGHT, MOVE.FALL].includes(move as MOVE)) {
    const newState = stepPiece(state, move as MOVE.LEFT | MOVE.RIGHT | MOVE.FALL)
    const releaseState = newState || state
    releaseState.keyUp = true
    return [releaseState]

  } else {
    state.keyUp = false
    let curState: TetrisState | null = dup(state)
    let lastState: TetrisState = curState
    const states = [] as TetrisState[]
    switch (move) {
      case MOVE.LEFTSIDE:
        while (curState) {
          states.push(curState)
          curState = stepPiece(curState, MOVE.LEFT)
          lastState = curState || lastState
        }
        break
      case MOVE.RIGHTSIDE:
        while (curState) {
          states.push(curState)
          curState = stepPiece(curState, MOVE.RIGHT)
          lastState = curState || lastState
        }
        break
      case MOVE.SOFTDROP:
        while (curState) {
          states.push(curState)
          curState = stepPiece(curState, MOVE.FALL)
          lastState = curState || lastState
        }
        break
      case LOCK:
        while (curState) {
          curState = stepPiece(curState, MOVE.FALL)
          lastState = curState || lastState
        }
        break
    }
    const releaseState = dup(lastState || state)
    releaseState.keyUp = true
    states.push(releaseState)
    // return states
    return [releaseState]
  }
}

const rotatePiece = (oldState: TetrisState, rotation: ROTATE): TetrisState => {
  const state = dup(oldState)
  state.keyUp = true
  switch (rotation) {
    case ROTATE.CLOCKWISE: state.key = KEY.UP; break
    case ROTATE.FLIP: state.key = KEY.A; break
    case ROTATE.COUNTERCLOCKWISE: state.key = KEY.Z; break
  }

  if (!state.piece || rotation === ROTATE.NOOP) return state

  const toRotation = getNextRotation(state.rotation, rotation)
  const newPosition = kickTest(
    state.grid,
    state.piece,
    state.position,
    state.rotation,
    toRotation,
  )
  if (!newPosition) return state

  state.position = newPosition
  state.rotation = toRotation
  return state
}

const holdPiece = (oldState: TetrisState): TetrisState => {
  const state = dup(oldState)
  state.key = KEY.SHIFT
  state.keyUp = true

  if (!state.canHold || !state.piece || (!state.hold && !state.next[0])) return state

  const heldPiece = state.hold || state.next.shift() as PIECE
  state.hold = state.piece
  state.piece = heldPiece
  state.canHold = false
  state.position = [4, 21]
  state.rotation = ROTATION.NORTH
  if (checkConflict(state)) throw new Error('gameover')
  return state
}

const lockPiece = (oldState: TetrisState): TetrisState[] => {
  const state = dup(oldState)
  state.key = KEY.SPACE
  state.keyUp = true

  const movedState = movePiece(state, LOCK)
  const lastState = movedState[movedState.length - 1] || state
  if (!lastState.piece) return [lastState]

  const positions = getPiecePositions(
    lastState.piece,
    lastState.rotation,
    ...lastState.position,
  )

  positions.forEach(([x, y]) => {
    if (y < 0 || y >= lastState.grid.length || x < 0 || x >= lastState.grid[0].length) return
    lastState.grid[y][x] = lastState.piece
  })
  const lockedState = dup(lastState)

  const { grid: clearedGrid } = clearLines(lastState.grid)
  lastState.grid = clearedGrid
  lastState.canHold = true

  lastState.piece = lastState.next.shift() || null
  lastState.position = [4, 21]
  lastState.rotation = ROTATION.NORTH
  if (checkConflict(lastState)) throw new Error('gameover')
  return [lockedState, lastState]
}
