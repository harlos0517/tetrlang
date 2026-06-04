/* eslint-disable no-unused-vars */

export type Position = [number, number]
export type Shape = Record<ROTATES, Position[]>
export type KickTable = Record<ROTATES, Record<ROTATES, Position[]>>

// export type COL = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
export type CONNECTOR = '-'
export type ROW_SEPARATOR = ','
export type HOLD = '|'
export type SEPARATOR = ':'
export type PIECES = 'I' | 'J' | 'L' | 'O' | 'S' | 'Z' | 'T'
export type GARBAGE = 'G'
export type ROTATES = 'o' | 'r' | 'a' | 'z'
export type MOVES = '[' | '<' | '>' | ']' | '.' | '_'
export type LOCK = ';'
export type KEYS =
  | 'ArrowLeft' | 'ArrowRight' | 'ArrowDown' | 'ArrowUp'
  | 'Space' | 'Shift' | 'KeyZ' | 'KeyA'

// export const COLS: COL[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
export const CONNECTOR: CONNECTOR = '-'
export const ROW_SEPARATOR: ROW_SEPARATOR = ','
export const HOLD: HOLD = '|'
export const SEPARATOR: SEPARATOR = ':'
export const PIECES: PIECES[] = ['I', 'J', 'L', 'O', 'S', 'Z', 'T']
export enum PIECE {
  I = 'I',
  J = 'J',
  L = 'L',
  O = 'O',
  S = 'S',
  Z = 'Z',
  T = 'T',
}
export const GARBAGE: GARBAGE = 'G'
export const ROTATES: ROTATES[] = ['o', 'r', 'a', 'z']
export enum ROTATE {
  NOOP = 'o',
  CLOCKWISE = 'r',
  FLIP = 'a',
  COUNTERCLOCKWISE = 'z',
}
export enum ROTATION {
  NORTH = 'o',
  EAST = 'r',
  SOUTH = 'a',
  WEST = 'z',
}
export const MOVES: MOVES[] = ['[', '<', '>', ']', '.', '_']
export enum MOVE {
  LEFT = '<',
  RIGHT = '>',
  FALL = '.',
  SOFTDROP = '_',
  RIGHTSIDE = ']',
  LEFTSIDE = '[',
}
export const LOCK: LOCK = ';'
export const KEYS: KEYS[] = [
  'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp',
  'Space', 'Shift', 'KeyZ', 'KeyA',
]
export enum KEY {
  LEFT = 'ArrowLeft',
  RIGHT = 'ArrowRight',
  DOWN = 'ArrowDown',
  UP = 'ArrowUp',
  SPACE = 'Space',
  SHIFT = 'Shift',
  A = 'KeyA',
  Z = 'KeyZ',
}

export type Row = boolean[]
export type Board = Row[]
export type Operation<HasOrder extends boolean> = {
  piece: HasOrder extends true ? null : PIECE
  ops: (MOVES | ROTATES | HOLD)[]
}

export type Compiled = {
  board: Board
  order: {
    holding: PIECE
    next: PIECE[]
  } | null
  operations: Operation<true>[] | Operation<false>[]
}
