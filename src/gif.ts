import { TetrisSession, TetrisState, TetrisStateData } from '@/tetris'
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
  [LOCK]: 2,
  [HOLD]: 1,
  'spawn': 1,
  'init': 3,
}

const delayMapWithStep: Record<TetrisStateData['operation'], number> = {
  [MOVE.FALL]: 1,
  [MOVE.LEFT]: 1,
  [MOVE.RIGHT]: 1,
  [MOVE.SOFTDROP]: 0.01,
  [MOVE.LEFTSIDE]: 0.01,
  [MOVE.RIGHTSIDE]: 0.01,
  [ROTATE.CLOCKWISE]: 1,
  [ROTATE.COUNTERCLOCKWISE]: 1,
  [ROTATE.FLIP]: 1,
  [ROTATE.NOOP]: 1,
  [LOCK]: 2,
  [HOLD]: 1,
  'spawn': 1,
  'init': 3,
}

const END_DELAY_RATIO = 3
const KEY_PRESS_RATIO = 0.6

const fixDelayTime = (delay: number) => {
  const ms = Math.ceil(delay)
  return ms > 0 ?  Math.max(ms, 20) : 0
}

export const generateGif = async(
  compiled: Compiled,
  options: GifOptions & { delay?: number, withStep?: boolean } = {},
  outputPath?: string,
) => {
  const { delay = 200, withStep = false, ...optionsExceptDelay } = options

  const session = new TetrisSession(compiled)
  session.generate(compiled)
  const states = session.states
  if (states.length === 0) throw new Error('No states to generate GIF from.')

  const framesData = states.map((state, i, s) => {
    const shouldDuplicate = state.key && state.keyUp
    const ratio = (withStep ? delayMapWithStep : delayMap)[state.operation]
    const subFrames: { state: TetrisState, delay: number }[] = []
    const isLastFrame = i === s.length - 1

    if (shouldDuplicate) {
      const releaseRatio = isLastFrame ? END_DELAY_RATIO : ratio
      const releaseDelay = fixDelayTime((1 - KEY_PRESS_RATIO) * releaseRatio * delay)
      if (releaseDelay > 0) {
        const releaseState = new TetrisState(state.operation, { ...state, key: null, keyUp: true })
        subFrames.unshift({ state: releaseState, delay: releaseDelay })
      }

      const keyPressRatio = subFrames.length === 0 ? END_DELAY_RATIO : ratio
      const keyPressDelay = isLastFrame && subFrames.length === 0 ?
        END_DELAY_RATIO : fixDelayTime(KEY_PRESS_RATIO * keyPressRatio * delay)
      if (keyPressDelay > 0) subFrames.unshift({ state, delay: keyPressDelay })
    } else {
      const frameRatio = isLastFrame ? END_DELAY_RATIO : ratio
      const frameDelay = fixDelayTime(frameRatio * delay)
      if (frameDelay > 0) subFrames.push({ state, delay: frameDelay })
    }
    return subFrames
  }).flat()

  const frames = framesData.map(({ state, delay }) => {
    const canvas = createFrame(state)
    return [canvas.toBuffer('image/png'), delay] as const
  })

  const lastFrame = frames[frames.length - 1]
  frames.push([lastFrame[0], END_DELAY_RATIO * delay])

  const gifOptions: GifOptions = {
    loop: 0,
    ...optionsExceptDelay,
    delay: frames.map(f => f[1]),
  }
  const gif = sharp(frames.map(f => f[0]), { join: { animated: true } })
    .gif(gifOptions)
  return outputPath ? await gif.toFile(outputPath) : await gif.toBuffer()
}
