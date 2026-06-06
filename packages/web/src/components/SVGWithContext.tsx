import React, { useCallback, useState } from 'react'

import SVGContext from '../context/SVGContext'

import type { MousePosition } from '../hooks/useMouse'

const SVGWithContext: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [position, setPosition] = useState<MousePosition>(null)
  const SVGRef = React.useRef<SVGSVGElement>(null)

  const onMouseEvent = useCallback((e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const svg = e.currentTarget
    const point = svg.createSVGPoint()
    point.x = e.clientX
    point.y = e.clientY

    const ctm = svg.getScreenCTM()
    if (!ctm) return

    const transformed = point.matrixTransform(ctm.inverse())
    const isLeave = e.type === 'mouseleave'
    setPosition(!isLeave ? { x: transformed.x, y: transformed.y } : null)
  }, [])

  return <svg
    width="100%"
    height="100%"
    viewBox="0 0 352 416"
    onMouseMove={onMouseEvent}
    onMouseLeave={onMouseEvent}
    ref={SVGRef}
    preserveAspectRatio="xMidYMid meet"
  >
    <SVGContext.Provider value={{ mousePosition: position, SVGRef }}>
      {children}
    </SVGContext.Provider>
  </svg>
}

export default SVGWithContext
