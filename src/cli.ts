import compiler from '@/compiler'
import { generateGif } from '@/gif'
import { createFrame } from '@/renderer'
import { TetrisState } from '@/tetris'
import { KEY, LOCK, PIECE, ROTATION } from '@/types'
import { Command } from 'commander'
import sharp from 'sharp'

const program = new Command()

program
  .name('tetr')
  .description('Transform tetrlang into gifs.')
  .version('0.0.1')

program.command('debug')
  .description('Debug the input.')
  .argument('<string>', 'string to split')
  .action(str => {
    console.log(JSON.stringify(compiler(str), null, 2))
  })

program.command('gen')
  .description('Generate a gif from the input.')
  .argument('<string>', 'string to compile')
  .option('-o, --output <file>', 'output file name', 'output.gif')
  .option('-d, --delay [ms]', 'frame delay in milliseconds', '500')
  .option('-s, --with-step', 'show consecutive moving steps', false)
  .action(async(str, options) => {
    const compiled = compiler(str)
    const gifOptions = {
      delay: parseInt(options.delay, 10),
      withStep: options.withStep,
    }
    await generateGif(compiled, gifOptions, options.output)
    console.log(`GIF generated at ${options.output}`)
  })

program.command('frame')
  .description('Generate an example frame.')
  .action(async _ => {
    const canvas = createFrame(new TetrisState(LOCK, {
      piece: PIECE.I,
      grid: [
        ...Array(8).fill(
          ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', null],
        ),
        ...Array(32).fill(Array(10).fill(null)),
      ],
      position: [8, 10],
      rotation: ROTATION.EAST,
      key: KEY.SPACE,
      keyUp: true,
      clearingLines: [4, 5, 6, 7],
      combo: 11,
      b2b: 64,
      spin: 'mini',
      spinned: PIECE.T,
      hold: PIECE.O,
      canHold: true,
      next: [PIECE.J, PIECE.L, PIECE.S, PIECE.Z, PIECE.T],
    }))
    const png = sharp(canvas.toBuffer('image/png'))
    png.toFile('output.png')
    console.log('PNG generated at output.png')
  })

program.parse()
