import { generateStates } from '@/tetris'
import sharp, { GifOptions } from 'sharp'
import { createFrame } from './renderer'
import { Compiled } from './types'

export const defaultGifOptions: GifOptions = {
  delay: 500,
  loop: 0,
}

export const generateGif = async(
  compiled: Compiled,
  options: GifOptions = defaultGifOptions,
  outputPath?: string,
) => {
  const states = generateStates(compiled)
  const frames = await Promise.all(states.map(async state => {
    const { canvas } = createFrame(state)
    return canvas.toBuffer('image/png')
  }))

  const gifOptions: GifOptions = {
    ...defaultGifOptions,
    ...options,
    delay: new Array(frames.length).fill(options.delay),
  }
  const gif = sharp(frames, { join: { animated: true } }).gif(gifOptions)
  return outputPath ? await gif.toFile(outputPath) : await gif.toBuffer()
}
