import { KEYS, ROTATION, TetrisState } from 'tetrlang-core'

import { CELL_SIZE, KEY_MAP, LINES_MAP, PIECE_COLORS } from '../utils/constants'
import { box, point } from '../utils/coords'
import GridBackground from './frame/GridBackground'
import GridCells from './frame/GridCells'
import KeyIcon from './frame/KeyIcon'
import Piece from './frame/Piece'

interface TetrlangFrameProps {
  state?: TetrisState
}

const TetrlangFrame = ({ state }: TetrlangFrameProps) => {
  const {
    grid,
    piece,
    rotation,
    position,
    ghostPiecePosition,
    clearingLines,
    hold,
    next,
    spinned,
    spin,
    key,
    combo,
    b2b,
  } = state || {}

  const titleStyle = {
    fill: 'white',
    fontSize: CELL_SIZE,
    textAnchor: 'middle' as const,
  }

  const authorStyle = {
    fill: '#888888',
    fontSize: CELL_SIZE * 0.6,
    textAnchor: 'middle' as const,
  }

  const accent = clearingLines && clearingLines.length > 0

  return <g>
    <g className="title">
      <text {...point(-3, 22)} {...titleStyle}>TETR</text>
      <text {...point(-3, 21)} {...titleStyle}>LANG</text>
    </g>
    <g className="author">
      <text {...point(13, 22)} {...authorStyle}>MADE BY</text>
      <text {...point(13, 21)} {...authorStyle}>HARLOS</text>
    </g>
    <GridBackground />
    {grid && <GridCells grid={grid} />}
    {piece && position && rotation && <Piece
      pieceType={piece}
      gridX={position[0]} gridY={position[1]}
      rotation={rotation}
    />}
    {piece && ghostPiecePosition && rotation && <Piece
      pieceType={piece}
      gridX={ghostPiecePosition[0]} gridY={ghostPiecePosition[1]}
      rotation={rotation}
      ghost
    />}
    {clearingLines && clearingLines.map(line => {
      const clearBox = box(0, line, 10, 1)
      return <rect key={line} {...clearBox} fill="white" />
    })}
    {hold && <Piece
      pieceType={hold}
      gridX={-4} gridY={17}
      rotation={ROTATION.NORTH}
    />}
    {next && next.length && next.slice(0, 5).filter(Boolean).map((p, i) => <Piece
      key={i}
      pieceType={p}
      gridX={12} gridY={17 - i * 4}
      rotation={ROTATION.NORTH}
    />)}
    <g className="spin-indicator">{spin
      ? spinned && <>
        {accent && <rect {...box(-5, 4.8, 4, 2)} fill={PIECE_COLORS[spinned]} />}
        <text
          {...point(-3, 5.8)}
          fontSize={CELL_SIZE}
          textAnchor="middle"
          fill="black"
        >{spinned}-SPIN</text>
        {accent && <text
          {...point(-3, 5)}
          fontSize={CELL_SIZE * 0.75}
          textAnchor="middle"
          fill="black"
        >{LINES_MAP[clearingLines.length]}</text>}
        {spin !== 'mini' && <text
          {...point(-3, 7)}
          fontSize={CELL_SIZE * 0.75}
          textAnchor="middle"
          fill={PIECE_COLORS[spinned]}
        >MINI</text>}
      </>
      : accent && <text
        {...point(-3, 5)}
        fontSize={CELL_SIZE * 0.75}
        textAnchor="middle"
        fill="white"
      >{LINES_MAP[clearingLines.length]}</text>
    }</g>
    <g className="keys">{KEYS.map(k => {
      const pressed = k === key
      const gridPos = KEY_MAP[k]
      return <KeyIcon
        key={k}
        kkey={k}
        {...gridPos}
        accent={pressed}
      />
    })}</g>
    <g className="combo">
      {combo && combo > 1 && <text
        textAnchor="middle"
        {...point(-3, 3.5)}
        fontSize={CELL_SIZE * 0.75}
        fill="white"
      >{combo - 1} COMBO</text>}
    </g>
    <g className="b2b">
      {b2b && b2b > 1 && <text
        textAnchor="middle"
        {...point(-3, 2)}
        fontSize={CELL_SIZE * 0.75}
        fill="white"
      >B2B x {b2b - 1}</text>}
    </g>
    <g className="perfect-clear">
      {state?.perfectClear?.() && <>
        <text
          textAnchor="middle"
          {...point(5, 16)}
          fontSize={CELL_SIZE * 1.75}
          fill="#FFBB00"
        >PERFECT</text>
        <text
          textAnchor="middle"
          {...point(5, 14)}
          fontSize={CELL_SIZE * 1.75}
          fill="#FFBB00"
        >CLEAR</text>
      </>}
    </g>
  </g>
}

export default TetrlangFrame
