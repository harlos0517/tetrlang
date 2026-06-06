import { useCallback, useEffect } from 'react'

export type MousePosition = { x: number, y: number } | null

export const useMouse = (
  ref: React.RefObject<Element  | null> | null,
  onDown: () => void = () => void 0,
  onUp: () => void = () => void 0,
  onMove: (isPressed: boolean) => void = () => void 0,
) => {
  const setMouseMove = useCallback((e: Event) => {
    const event = e as MouseEvent
    onMove(event.buttons > 0)
  }, [onMove])
  const setMouseLeave = useCallback(
    (e: Event) => { if ((e as MouseEvent).buttons > 0) onUp() },
    [onUp],
  )

  useEffect(() => {
    const refCurrent = ref?.current
    refCurrent?.addEventListener('mousedown', onDown)
    refCurrent?.addEventListener('mouseup', onUp)
    refCurrent?.addEventListener('mouseleave', setMouseLeave)
    refCurrent?.addEventListener('mousemove', setMouseMove)
    return () => {
      refCurrent?.removeEventListener('mousedown', onDown)
      refCurrent?.removeEventListener('mouseup', onUp)
      refCurrent?.removeEventListener('mouseleave', setMouseLeave)
      refCurrent?.removeEventListener('mousemove', setMouseMove)
    }
  }, [onDown, onUp, setMouseMove, ref, setMouseLeave])
}
