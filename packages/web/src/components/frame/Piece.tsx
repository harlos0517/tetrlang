import { getPiecePositions, type PIECE, type ROTATION } from 'tetrlang-core'

import { PIECE_COLORS } from '../../utils/constants'
import GridCell from './GridCell'

interface PieceProps {
  pieceType: PIECE
  gridX: number
  gridY: number
  rotation: ROTATION
  ghost?: boolean
}

const Piece = ({
  pieceType,
  gridX,
  gridY,
  rotation,
  ghost = false,
}: PieceProps) => {
  console.log('Rendering piece', { pieceType, gridX, gridY, rotation })
  const positions = getPiecePositions(pieceType, rotation, gridX, gridY)


  return <g className={`piece ${ghost ? 'ghost' : ''}`}>
    {positions.map(([x, y]) =>
      <GridCell
        key={`${x}-${y}`}
        gridX={x} gridY={y}
        color={PIECE_COLORS[pieceType]}
        ghost={ghost}
      />,
    )}
  </g>
}

export default Piece
