import { TetrisSession } from '@/tetris'
import sharp, { GifOptions } from 'sharp'
import { createFrames, END_DELAY_MAP } from './renderer'
import { Compiled } from './types'

export const generateGif = async(
  compiled: Compiled,
  options: GifOptions & { delay?: number } = {},
  outputPath?: string,
) => {
  const { delay = 200, ...optionsExceptDelay } = options

  const session = new TetrisSession(compiled)
  session.generate(compiled)
  const frames: [Buffer, number][] = []
  for (let i = 0; i < session.states.length; i++) {
    const state = session.states[i]
    const frameData = createFrames(state)
    for (const frame of frameData) {
      const { canvas, delayRatio } = frame
      const ms = Math.ceil(delayRatio * delay)
      const frameDelay =  ms > 0 ?  Math.max(ms, 20) : 0
      frames.push([canvas.toBuffer('image/png'), frameDelay])
    }
  }

  const lastFrame = frames[frames.length - 1]
  frames.push([lastFrame[0], END_DELAY_MAP * delay])

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
