import {
  Compiled,
  CONNECTOR,
  HOLD,
  LOCK,
  MOVES,
  Operation,
  PIECE,
  PIECES,
  ROTATES,
  Row,
  ROW_SEPARATOR,
  SEPARATOR,
} from './types'

const parseRow = (row: string): Row | null => {
  if (row === '') return null

  const result: Row = [true, true, true, true, true, true, true, true, true, true]

  let i = 0
  const isFirst = () => i - 1 === 0
  const isLast = (offset = 0) => i + offset === row.length - 1
  const isCol = (char: string) => {
    if (char >= '0' && char <= '9') return true
    throw new Error(`Invalid column character: ${char}`)
  }

  while (i < row.length) {
    const char = row[i++]

    // Handle range_begin (like "-2")
    if (char === CONNECTOR && isFirst()) {
      const endCol = parseInt(row[i++])
      for (let col = 0; col <= endCol; col++) result[col] = false

    // Handle range_end (like "3-" at end)
    } else if (isCol(char) && isLast() && row[i] === CONNECTOR) {
      const startCol = parseInt(char)
      for (let col = startCol; col < 10; col++) result[col] = false
      break

    // Handle range (like "1-3")
    } else if (isCol(char) && row[i] === CONNECTOR && isCol(row[i + 1])) {
      i++ // Skip CONNECTOR
      const startCol = parseInt(char)
      const endCol = parseInt(row[i++])
      for (let col = startCol; col <= endCol; col++) result[col] = false

    // Handle individual column
    } else if (isCol(char)) {
      const col = parseInt(char)
      result[col] = false
    }
  }

  return result
}

const parseOperations = <HasOrder extends boolean>(
  operations: string,
  hasOrder: HasOrder,
): Operation<HasOrder>[] => {
  const slicedOperations = operations.endsWith(LOCK) ? operations.slice(0, -1) : operations
  return slicedOperations.split(LOCK).map(op => {
    let hold = false
    if (op.startsWith(HOLD)) {
      op = op.slice(1)
      hold = true
    }
    const ops = op.split('') as (MOVES | ROTATES)[]
    const piece = hasOrder ? null : ops.shift() as PIECE
    if (piece && !PIECES.includes(piece)) throw new Error(`Invalid piece: ${piece}`)
    if (ops.some(op => ![...ROTATES, ...MOVES].includes(op)))
      throw new Error(`Invalid operation: ${op}`)
    return {
      hold,
      piece: piece as HasOrder extends true ? null : PIECE,
      ops,
    }
  })
}

export default (input: string): Compiled => {
  const [context, orderString, opString] = input.split(SEPARATOR)
  if (context === undefined || opString === undefined || orderString === undefined)
    throw new Error(`Invalid input: ${input}`)

  const rows = context ? context.split(ROW_SEPARATOR) : []
  const board: Row[] = []
  let prevRow: Row | null = null
  for (const row of rows) {
    const parsedRow = parseRow(row)
    if (!parsedRow) {
      if (!prevRow) throw new Error('First row cannot be empty')
      else board.push([...prevRow])
    } else {
      board.push(parsedRow)
      prevRow = [...parsedRow]
    }
  }

  const slicedOperations = opString.endsWith(LOCK) ? opString.slice(0, -1) : opString
  const operations = parseOperations(slicedOperations, !!orderString)

  const orderParts = orderString.split(HOLD)
  const [holding, nextString] = orderParts.length === 2 ? orderParts
    : orderParts.length === 1 ? ['', orderParts[0]] :
      orderParts.length === 0 ? ['', '']
        : (() => { throw new Error(`Invalid order: ${orderString}`) })()

  if (holding.length > 1 || (holding && !PIECES.includes(holding as PIECE)))
    throw new Error(`Invalid holding piece: ${holding}`)
  if (nextString.length < operations.length)
    // eslint-disable-next-line @stylistic/max-len
    throw new Error(`Next pieces count (${nextString.length}) must >= operations count (${operations.length})`)

  const next = nextString.split('')
  if (next.some(n => !PIECES.includes(n as PIECE)))
    throw new Error(`Invalid next: ${nextString}`)

  const order = {
    holding: holding as PIECE,
    next: next as PIECE[],
  }

  return {
    board,
    order,
    operations,
  }
}
