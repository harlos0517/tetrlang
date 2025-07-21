import {
  Compiled,
  HOLD,
  LOCK,
  MOVES,
  Operation,
  Order,
  PIECE,
  PIECES,
  ROTATES,
  Row,
  ROW_SEPARATOR,
  START,
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
    if (char === '-' && isFirst()) {
      const endCol = parseInt(row[i++])
      for (let col = 0; col <= endCol; col++) result[col] = false

    // Handle range_end (like "3-" at end)
    } else if (isCol(char) && isLast() && row[i] === '-') {
      const startCol = parseInt(char)
      for (let col = startCol; col < 10; col++) result[col] = false
      break

    // Handle range (like "1-3")
    } else if (isCol(char) && row[i] === '-' && isCol(row[i + 1])) {
      i++ // Skip the '-'
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
  const [context, operations] = input.split(START)
  if (context === undefined || operations === undefined)
    throw new Error(`Invalid input: ${input}`)
  const rows = context.split(ROW_SEPARATOR)
  const order = rows.pop()

  const rowResults: Row[] = []
  let prevRow: Row | null = null
  for (const row of rows) {
    const parsedRow = parseRow(row)
    if (!parsedRow) {
      if (!prevRow) throw new Error('First row cannot be empty')
      else rowResults.push([...prevRow])
    } else {
      rowResults.push(parsedRow)
      prevRow = [...parsedRow]
    }
  }

  const orderResult: Order | null = order ? {
    holding: order.split(HOLD)[0] as PIECE,
    next: order.split(HOLD)[1].split('') as PIECE[],
  } : null

  if (orderResult &&
    [orderResult.holding, ...orderResult.next].some(piece => !PIECES.includes(piece))
  ) throw new Error(`Invalid order: ${order}`)

  const slicedOperations = operations.endsWith(LOCK) ? operations.slice(0, -1) : operations
  const operationsResult = orderResult
    ? parseOperations(slicedOperations, true)
    : parseOperations(slicedOperations, false)

  return {
    board: rowResults,
    order: orderResult,
    operations: operationsResult,
  }
}
