import { type Grid } from 'tetrlang-core'

import { PIECE_COLORS } from '../../utils/constants'
import GridCell from './GridCell'

interface GridCellsProps {
  grid: Grid
}

interface CellInfo { x: number, y: number, color: string }

const GridCells = ({ grid }: GridCellsProps) => {
  const cells = grid.flatMap((row, y) =>
    row.map((c, x) => {
      if (!c) return null
      return { x, y, color: PIECE_COLORS[c] }
    }).filter(Boolean) as CellInfo[],
  )

  return <g className="grid-cells">
    {cells.map(({ x, y, color }) =>
      <GridCell
        key={`${x}-${y}`}
        gridX={x}
        gridY={y}
        color={color}
      />,
    )}
  </g>
}

export default GridCells
