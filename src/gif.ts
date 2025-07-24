import { TetrisSession } from '@/tetris'
import sharp, { GifOptions } from 'sharp'
import { createFrame, END_DELAY_MAP } from './renderer'
import { Compiled } from './types'

export const generateGif = async(
  compiled: Compiled,
  options: GifOptions & { delay?: number } = {},
  outputPath?: string,
) => {
  const { delay, ...optionsExceptDelay } = options

  const session = new TetrisSession(compiled)
  session.generate(compiled)
  const frames = await Promise.all(session.states.map(async(state, index, arr) => {
    const { canvas, delayRatio } = createFrame(state)
    const ratio = index === arr.length - 1 ? END_DELAY_MAP : delayRatio
    const ms = Math.ceil(ratio * (delay || 200))
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
