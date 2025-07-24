import { Grid, boardToGrid, clearLines, isFillable } from './grid'
import { getNextRotation, getPiecePositions, kickTest } from './srs'
import {
  Compiled,
  HOLD,
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

const dup = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))

export interface TetrisStateData {
  grid: Grid
  piece: PIECE | null
  position: Position
  rotation: ROTATION
  hold: PIECE | null
  canHold: boolean
  next: PIECE[]
  key: KEY | null
  keyUp: boolean
  clearingLines?: number[]
  operation: MOVES | ROTATES | LOCK | HOLD | 'spawn' | 'init'
}

export class TetrisSession {
  public readonly data: Compiled
  public readonly states: TetrisState[]
  public generated = false

  constructor(data: Compiled) {
    this.data = data
    this.states = []
  }

  private add(state: TetrisState): void {
    this.states.push(new TetrisState(state.operation, dup(state)))
  }

  public generate(data: Compiled) {
    try {
      const initialState = TetrisState.initFromCompiled(data)
      this.add(initialState)
      this.add(initialState.spawn())

      for (const operation of data.operations) {
        const allOperations = [
          ...operation.hold ? [HOLD] : [],
          ...operation.ops,
          LOCK,
        ]
        for (const op of allOperations) {
          const newStates = this.currentState.handleOperation(op)
          newStates.forEach(s => this.add(s))
        }
      }
    } catch(error) {
      if (error instanceof TetrisGameOver) {
        this.add(error.state)
        console.warn('Game Over:', error.state)
      } else if (error instanceof TetrisOperationError) {
        this.add(error.state)
        console.warn('Operation Error:', error.state, error.message)
      } else
        console.error('Unexpected error during Tetris session generation:', error)
    }

    console.log(this.states.length, 'states generated')
    this.generated = true
  }

  public get currentState(): TetrisState {
    return this.states[this.states.length - 1]
  }
}

export class TetrisGameOver extends Error {
  state: TetrisState

  constructor(state: TetrisState) {
    super('Game Over')
    Object.setPrototypeOf(this, TetrisGameOver.prototype)
    this.state = state
  }
}

export class TetrisOperationError extends Error {
  state: TetrisState

  constructor(state: TetrisState, message = 'unknown') {
    super(`Operation Error: ${message}`)
    Object.setPrototypeOf(this, TetrisOperationError.prototype)
    this.state = state
  }
}

export class TetrisState implements TetrisStateData {
  public readonly grid: Grid
  public readonly piece: PIECE | null
  public readonly position: Position
  public readonly rotation: ROTATION
  public readonly hold: PIECE | null
  public readonly canHold: boolean
  public readonly next: PIECE[]
  public readonly key: KEY | null
  public readonly keyUp: boolean
  public readonly clearingLines?: number[]
  public readonly operation: MOVES | ROTATES | LOCK | HOLD | 'spawn' | 'init'

  constructor(
    operation: MOVES | ROTATES | LOCK | HOLD | 'spawn' | 'init',
    data: Omit<TetrisStateData, 'operation'>,
  ) {
    const {
      grid,
      piece,
      position,
      rotation,
      hold,
      canHold,
      next,
      key,
      keyUp,
      clearingLines,
    } = data
    const newData: TetrisStateData = {
      grid: dup(grid),
      piece,
      position: dup(position),
      rotation,
      hold,
      canHold,
      next: dup(next),
      key,
      keyUp,
      clearingLines: dup(operation === LOCK ? clearingLines || [] : []),
      operation,
    }
    this.grid = newData.grid
    this.piece = newData.piece
    this.position = newData.position
    this.rotation = newData.rotation
    this.hold = newData.hold
    this.canHold = newData.canHold
    this.next = newData.next
    this.key = newData.key
    this.keyUp = newData.keyUp
    this.clearingLines = newData.clearingLines
    this.operation = newData.operation
  }

  public static initFromCompiled(data: Compiled): TetrisState {
    return new TetrisState('init', {
      grid: boardToGrid(data.board),
      piece: null,
      position: [4, 21] as Position,
      rotation: ROTATION.NORTH,
      hold: data.order?.holding || null,
      canHold: true,
      next: data.order?.next || data.operations.map(op => op.piece).filter(Boolean) as PIECE[],
      key: null,
      keyUp: true,
      clearingLines: [],
    })
  }

  public handleOperation(op: MOVES | ROTATES | LOCK | HOLD): TetrisState[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const operation = op as any
    if ([MOVE.LEFTSIDE, MOVE.RIGHTSIDE, MOVE.SOFTDROP].includes(operation))
      return this.movePiece(operation)
    else if ([MOVE.LEFT, MOVE.RIGHT, MOVE.FALL].includes(operation))
      return [this.stepPiece(operation)]
    else if (ROTATES.includes(operation))
      return [this.rotatePiece(operation)]
    else if (operation === LOCK)
      return this.lockPiece()
    else if (operation === HOLD)
      return [this.holdPiece()]
    else throw new Error(`Unknown operation: ${op}`)
  }

  public conflict(): boolean {
    return !!this.piece && !getPiecePositions(this.piece, this.rotation, ...this.position)
      .every(([x, y]) => isFillable(this.grid, x, y))
  }

  public stepPiece(move: MOVE | LOCK, single = true): TetrisState {
    const key = {
      [MOVE.LEFTSIDE]: KEY.LEFT,
      [MOVE.RIGHTSIDE]: KEY.RIGHT,
      [MOVE.SOFTDROP]: KEY.DOWN,
      [MOVE.LEFT]: KEY.LEFT,
      [MOVE.RIGHT]: KEY.RIGHT,
      [MOVE.FALL]: KEY.DOWN,
      [LOCK]: KEY.SPACE,
    }[move]
    const op = {
      [MOVE.LEFTSIDE]: MOVE.LEFT,
      [MOVE.RIGHTSIDE]: MOVE.RIGHT,
      [MOVE.SOFTDROP]: MOVE.FALL,
      [MOVE.LEFT]: MOVE.LEFT,
      [MOVE.RIGHT]: MOVE.RIGHT,
      [MOVE.FALL]: MOVE.FALL,
      [LOCK]: LOCK,
    }[move]
    if (!this.piece) return new TetrisState(op, { ...this, key, keyUp: true })

    const position = dup(this.position)
    ;({
      [MOVE.LEFTSIDE]: () => position[0]--,
      [MOVE.RIGHTSIDE]: () => position[0]++,
      [MOVE.SOFTDROP]: () => position[1]--,
      [MOVE.LEFT]: () => position[0]--,
      [MOVE.RIGHT]: () => position[0]++,
      [MOVE.FALL]: () => position[1]--,
      [LOCK]: () => position[1]--,
    })[move]()
    const newState = new TetrisState(move, { ...this, key, keyUp: single, position })
    if (newState.conflict())
      return new TetrisState(op, { ...this, key, keyUp: true })
    return newState
  }

  public movePiece(move: MOVE.LEFTSIDE | MOVE.RIGHTSIDE | MOVE.SOFTDROP | LOCK): TetrisState[] {
    const states = [] as TetrisState[]
    let lastState: TetrisState | null = null
    let end = false
    while (!end) {
      const oldState: TetrisState = lastState || this
      const newState = oldState.stepPiece(move, false)
      if (newState.keyUp || move !== LOCK) states.push(newState)
      lastState = newState
      end = newState.keyUp
    }
    return states
  }

  public rotatePiece(rotation: ROTATE): TetrisState {
    const key = {
      [ROTATE.NOOP]: null,
      [ROTATE.CLOCKWISE]: KEY.UP,
      [ROTATE.FLIP]: KEY.A,
      [ROTATE.COUNTERCLOCKWISE]: KEY.Z,
    }[rotation]

    if (!this.piece || rotation === ROTATE.NOOP || !key)
      return new TetrisState(rotation, { ...this, key, keyUp: true })

    const toRotation = getNextRotation(this.rotation, rotation)
    const position = kickTest(
      this.grid,
      this.piece,
      this.position,
      this.rotation,
      toRotation,
    )
    if (!position) return new TetrisState(rotation, { ...this, key, keyUp: true })
    return new TetrisState(rotation, { ...this, position, rotation: toRotation, key, keyUp: true })
  }

  public holdPiece(): TetrisState {
    const key = KEY.SHIFT
    const keyUp = true

    if (!this.canHold || !this.piece || (!this.hold && !this.next[0]))
      return new TetrisState(HOLD, { ...this, key, keyUp })

    const newState = new TetrisState(HOLD, {
      ...this,
      piece: this.hold || this.next[0] as PIECE,
      hold: this.piece,
      canHold: false,
      position: [4, 21],
      rotation: ROTATION.NORTH,
      key,
      keyUp,
    })
    if (newState.conflict()) throw new TetrisGameOver(newState)
    return newState
  }

  public spawn(newGrid?: Grid): TetrisState {
    const spawnState = new TetrisState('spawn', {
      ...this,
      grid: newGrid || dup(this.grid),
      piece: this.next[0] || null,
      next: this.next.slice(1),
      position: [4, 21] as Position,
      rotation: ROTATION.NORTH,
      canHold: true,
      clearingLines: [],
    })
    if (spawnState.conflict()) throw new TetrisGameOver(spawnState)
    return spawnState
  }

  public get ghostPiecePosition(): Position | null {
    if (!this.piece) return null
    const lockStates = this.movePiece(LOCK)
    const state = lockStates[lockStates.length - 1] || this
    return state.position
  }

  public lockPiece(): TetrisState[] {
    const lockStates = this.movePiece(LOCK)
    const state = lockStates[lockStates.length - 1] || this
    if (!state.piece) throw new TetrisOperationError(state, 'No piece to lock')

    const newGrid = dup(state.grid)
    const positions = getPiecePositions(
      state.piece,
      state.rotation,
      ...state.position,
    )
    positions.forEach(([x, y]) => {
      if (y < 0 || y >= state.grid.length || x < 0 || x >= state.grid[0].length) return
      newGrid[y][x] = state.piece
    })

    const { grid: clearedGrid, clearedLines: clearingLines } = clearLines(newGrid)
    const lockedState = new TetrisState(LOCK, {
      ...state,
      clearingLines,
      grid: newGrid,
      piece: null,
    })

    return [lockedState, lockedState.spawn(clearedGrid)]
  }
}
