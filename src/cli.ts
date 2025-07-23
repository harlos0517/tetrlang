import compiler from '@/compiler'
import { generateGif } from '@/gif'
import { Command } from 'commander'

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
  .option('-d, --delay <ms>', 'frame delay in milliseconds', '500')
  .action(async(str, options) => {
    const compiled = compiler(str)
    const gifOptions = { delay: parseInt(options.delay, 10) }
    await generateGif(compiled, gifOptions, options.output)
    console.log(`GIF generated at ${options.output}`)
  })

program.parse()
