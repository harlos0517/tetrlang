import React, { createContext } from 'react'

import type { MousePosition } from '../hooks/useMouse'

interface SVGContextProps {
  mousePosition: MousePosition
  SVGRef: React.RefObject<SVGSVGElement | null> | null
}

const SVGContext = createContext<SVGContextProps>({
  mousePosition: null,
  SVGRef: null,
})

export default SVGContext
