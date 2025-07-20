/* eslint-disable no-unused-vars */

export type Position = [number, number]
export type Shape = Record<ROTATIONS, Position[]>
export type KickTable = Record<ROTATIONS, Record<ROTATIONS, Position[]>>

export type COL = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
export type CONNECTOR = '-'
export type ROW_SEPARATOR = ','
export type HOLD = '/'
export type START = ':'
export type PIECES = 'I' | 'J' | 'L' | 'O' | 'S' | 'Z' | 'T'
export type GARBAGE = 'G'
export type ROTATES = 'x' | 'r' | 'a' | 'c'
export type ROTATIONS = 'X' | 'R' | 'A' | 'C'
export type MOVES = '[' | '<' | '>' | ']' | '.' | '+'
export type LOCK = '_'
export type KEYS =
  | 'ArrowLeft' | 'ArrowRight' | 'ArrowDown' | 'ArrowUp'
  | 'Space' | 'Shift' | 'KeyZ' | 'KeyX'

export const COLS: COL[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
export const CONNECTOR: CONNECTOR = '-'
export const ROW_SEPARATOR: ROW_SEPARATOR = ','
export const HOLD: HOLD = '/'
export const START: START = ':'
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
export const ROTATES: ROTATES[] = ['x', 'r', 'a', 'c']
export enum ROTATE {
  NOOP = 'x',
  CLOCKWISE = 'r',
  FLIP = 'a',
  COUNTERCLOCKWISE = 'c',
}
export const ROTATIONS: ROTATIONS[] = ['X', 'R', 'A', 'C']
export enum ROTATION {
  NORTH = 'X',
  EAST = 'R',
  SOUTH = 'A',
  WEST = 'C',
}
export const MOVES: MOVES[] = ['[', '<', '>', ']', '.', '+']
export enum MOVE {
  LEFT = '<',
  RIGHT = '>',
  FALL = '.',
  SOFTDROP = '+',
  RIGHTSIDE = ']',
  LEFTSIDE = '[',
}
export const LOCK: LOCK = '_'
export const KEYS: KEYS[] = [
  'ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp',
  'Space', 'Shift', 'KeyZ', 'KeyX',
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
export type Order = {
  holding: PIECE
  next: PIECE[]
}
export type Operation<HasOrder extends boolean> = {
  hold: boolean
  piece: HasOrder extends true ? null : PIECE
  ops: (MOVES | ROTATES)[]
}

export type Compiled = {
  board: Board
  order: Order | null
  operations: Operation<true>[] | Operation<false>[]
}
