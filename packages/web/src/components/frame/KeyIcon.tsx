import { KEY, KEYS } from 'tetrlang-core'

import { CELL_SIZE } from '../../utils/constants'
import { box, point } from '../../utils/coords'

interface KeyIconProps {
  kkey: KEYS
  x: number
  y: number
  accent?: boolean
}

const KeyIcon = ({ kkey, x, y, accent = false }: KeyIconProps) => {
  const GAP = CELL_SIZE / 8

  const pathStyle = {
    fill: 'none',
    stroke: accent ? 'black' : 'white',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: GAP,
  }

  const p = point(x + 1, y + 1)
  const _ = (_x: number, _y: number) => `${p.x + GAP * _x},${p.y - GAP * _y}`

  const paths: Record<KEYS, string> = {
    [KEY.SHIFT]: `
      M ${_(-4, 1)} L ${_(4, 1)} L ${_(2, 3)}
      M ${_(4, -1)} L ${_(-4, -1)} L ${_(-2, -3)}
    `,
    [KEY.A]: `
      M ${_(-2, -4)} L ${_(-2, 2)}
        A ${GAP * 2} ${GAP * 2} 0 0 1 ${_(0, 4)}
        A ${GAP * 2} ${GAP * 2} 0 0 1 ${_(2, 2)}
        L ${_(2, -4)}
      M ${_(4, -2)} L ${_(2, -4)} L ${_(0, -2)}
    `,
    [KEY.Z]: `
      M ${_(0, -3)}
        A ${GAP * 3} ${GAP * 3} 0 0 0 ${_(3, 0)}
        A ${GAP * 3} ${GAP * 3} 0 0 0 ${_(0, 3)}
        A ${GAP * 3} ${GAP * 3} 0 0 0 ${_(-3, 0)}
        L ${_(-3, -2)}
      M ${_(-5, 0)} L ${_(-3, -2)} L ${_(-1, 0)}
    `,
    [KEY.UP]: `
      M ${_(0, -3)}
        A ${GAP * 3} ${GAP * 3} 0 0 1 ${_(-3, 0)}
        A ${GAP * 3} ${GAP * 3} 0 0 1 ${_(0, 3)}
        A ${GAP * 3} ${GAP * 3} 0 0 1 ${_(3, 0)}
        L ${_(3, -2)}
      M ${_(5, 0)} L ${_(3, -2)} L ${_(1, 0)}
    `,
    [KEY.LEFT]: `
      M ${_(4, 0)} L ${_(-4, 0)}
      M ${_(-2, 2)} L ${_(-4, 0)} L ${_(-2, -2)}
    `,
    [KEY.RIGHT]: `
      M ${_(-4, 0)} L ${_(4, 0)}
      M ${_(2, 2)} L ${_(4, 0)} L ${_(2, -2)}
    `,
    [KEY.SPACE]: `
      M ${_(0, 4)} L ${_(0, -2)}
      M ${_(-2, 0)} L ${_(0, -2)} L ${_(2, 0)}
      M ${_(-2, -4)} L ${_(2, -4)}
    `,
    [KEY.DOWN]: `
      M ${_(0, 4)} L ${_(0, -4)}
      M ${_(-2, -2)} L ${_(0, -4)} L ${_(2, -2)}
    `,
  }

  const boxAttr = box(x, y, 2, 2)

  if (!accent) {
    boxAttr.x += CELL_SIZE / 16
    boxAttr.y += CELL_SIZE / 16
    boxAttr.width -= CELL_SIZE / 8
    boxAttr.height -= CELL_SIZE / 8
  }

  return <g className="key-icon">
    {accent
      ? <rect {...boxAttr} fill="white" />
      : <rect
        {...boxAttr}
        fill="transparent"
        stroke="white"
        strokeWidth={CELL_SIZE / 8}
      />
    }
    <path d={paths[kkey]} style={pathStyle} />
  </g>
}

export default KeyIcon
