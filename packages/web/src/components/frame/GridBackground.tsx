import { DISPLAY_HEIGHT, GRID_WIDTH } from 'tetrlang-core'

import { BOARD_PADDING, CELL_BORDER, LINE_WIDTH } from '../../utils/constants'
import { point } from '../../utils/coords'
import GridCell from './GridCell'

const GridBackground = () => {

  const offset = LINE_WIDTH / 2 - CELL_BORDER + BOARD_PADDING
  const corner1 = point(0, DISPLAY_HEIGHT, -offset, -CELL_BORDER)
  const corner2 = point(0, 0, -offset, -offset)
  const corner3 = point(GRID_WIDTH, 0, offset, -offset)
  const corner4 = point(GRID_WIDTH, DISPLAY_HEIGHT, offset, -CELL_BORDER)
  const gridBorderPath = `
    M ${corner1.x} ${corner1.y}
    L ${corner2.x} ${corner2.y}
    L ${corner3.x} ${corner3.y}
    L ${corner4.x} ${corner4.y}
  `

  return <g className="grid-background">
    {Array.from({ length: DISPLAY_HEIGHT }, (_, y) =>
      Array.from({ length: GRID_WIDTH }, (_, x) =>
        <GridCell
          key={`${x}-${y}`}
          gridX={x} gridY={y}
          color={(x + y) % 2 === 0 ? '#111111' : '#222222'}
        />,
      ),
    )}
    <g className="grid-border">
      <path
        d={gridBorderPath}
        stroke='white'
        strokeWidth={LINE_WIDTH}
        fill='none'
      />
    </g>
  </g>
}

export default GridBackground
