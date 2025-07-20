import { generateStates } from '@/tetris'
import sharp, { GifOptions } from 'sharp'
import { createFrame } from './renderer'
import { Compiled } from './types'

export const defaultGifOptions: GifOptions = {
  delay: 100,
  loop: 0,
}

export const generateGif = async(
  compiled: Compiled,
  outputPath: string,
  options: GifOptions = defaultGifOptions,
): Promise<void> => {
  const states = generateStates(compiled)
  const frames = await Promise.all(states.map(async state => {
    const { canvas } = createFrame(state)
    return canvas.toBuffer('image/png')
  }))

  await sharp(frames, { join: { animated: true } })
    .gif(options)
    .toFile(outputPath)
}
