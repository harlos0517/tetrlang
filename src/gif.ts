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
  [LOCK]: 1,
  [HOLD]: 1,
  'spawn': 1,
  'clearing': 1,
  'init': 3,
}

export const generateGif = async(
  compiled: Compiled,
  options: GifOptions & { delay?: number } = {},
  outputPath?: string,
) => {
  const session = new TetrisSession(compiled)
  session.generate(compiled)
  const frames = await Promise.all(session.states.map(async state => {
    const { canvas } = createFrame(state)
    return canvas.toBuffer('image/png')
  }))

  const { delay, ...optionsExceptDelay } = options
  const getDelays = (s: TetrisStateData) =>
    Math.max(Math.ceil(delayMap[s.operation] * (delay || 200)), 20)
  const gifOptions: GifOptions = {
    loop: 0,
    ...optionsExceptDelay,
    delay: session.states.map(getDelays),
  }
  const gif = sharp(frames, { join: { animated: true } }).gif(gifOptions)
  return outputPath ? await gif.toFile(outputPath) : await gif.toBuffer()
}
