import { CELL_SIZE } from '../../utils/constants'
import { cell } from '../../utils/coords'

interface GridCellProps {
  gridX: number
  gridY: number
  color: string
  ghost?: boolean
}

const GridCell = ({ gridX, gridY, color, ghost }: GridCellProps) => {
  let { x, y, width, height } = cell(gridX, gridY)

  if (ghost) {
    x += CELL_SIZE / 16
    y += CELL_SIZE / 16
    width -= CELL_SIZE / 8
    height -= CELL_SIZE / 8
  }
  return (
    <rect
      key={`${gridX}-${gridY}`}
      x={x}
      y={y}
      width={width}
      height={height}
      fill={ghost ? 'transparent' : color}
      stroke={ghost ? color : 'transparent'}
      strokeWidth={CELL_SIZE / 8}
    />
  )
}

export default GridCell
