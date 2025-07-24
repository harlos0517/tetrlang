import { TetrisSession, TetrisStateData } from '@/tetris'
import sharp, { GifOptions } from 'sharp'
import { createFrame } from './renderer'
import { Compiled, HOLD, LOCK, MOVE, ROTATE } from './types'

const delayMap: Record<TetrisStateData['operation'], number> = {
  [MOVE.FALL]: 1,
  [MOVE.LEFT]: 1,
  [MOVE.RIGHT]: 1,
  [MOVE.SOFTDROP]: 0,
  [MOVE.LEFTSIDE]: 0,
  [MOVE.RIGHTSIDE]: 0,
  [ROTATE.CLOCKWISE]: 1,
  [ROTATE.COUNTERCLOCKWISE]: 1,
  [ROTATE.FLIP]: 1,
  [ROTATE.NOOP]: 1,
  [LOCK]: 0,
  [HOLD]: 1,
  'spawn': 1,
  'clearing': 1,
  'init': 3,
}

const END_DELAY_MAP = 3

export const generateGif = async(
  compiled: Compiled,
  options: GifOptions & { delay?: number } = {},
  outputPath?: string,
) => {
  const { delay, ...optionsExceptDelay } = options

  const session = new TetrisSession(compiled)
  session.generate(compiled)
  const frames = await Promise.all(session.states.map(async(state, index, arr) => {
    const { canvas } = createFrame(state)
    const delayRatio = index === arr.length - 1
      ? END_DELAY_MAP
      : delayMap[state.operation]
    const ms = Math.ceil(delayRatio * (delay || 200))
    const frameDelay =  ms > 0 ?  Math.max(ms, 20) : 0
    return [canvas.toBuffer('image/png'), frameDelay] as const
  }))

  const filteredFrames = frames.filter(([_, delay]) => delay > 0)

  const gifOptions: GifOptions = {
    loop: 0,
    ...optionsExceptDelay,
    delay: filteredFrames.map(f => f[1]),
  }
  const gif = sharp(filteredFrames.map(f => f[0]), { join: { animated: true } })
    .gif(gifOptions)
  return outputPath ? await gif.toFile(outputPath) : await gif.toBuffer()
}
