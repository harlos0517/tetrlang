import { generateGif } from '@/gif'
import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  Client,
  Events,
  GatewayIntentBits,
  SlashCommandBuilder,
} from 'discord.js'
import dotenv from 'dotenv'
import compiler from './compiler'

dotenv.config()

const DELAY_MS = 250

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

const commands = [
  new SlashCommandBuilder().setName('tetr')
    .setDescription('Generate a Tetris GIF from Tetrlang code')
    .addSubcommand(subcommand => subcommand
      .setName('gen')
      .setDescription('Generate a Tetris GIF from Tetrlang code')
      .addStringOption(option => option
        .setName('code')
        .setDescription('The Tetrlang code to compile')
        .setRequired(true)
        .setMaxLength(256),
      ).addIntegerOption(option => option
        .setName('delay')
        .setDescription(`Frame delay in milliseconds (default: ${DELAY_MS})`)
        .setRequired(false)
        .setMinValue(100)
        .setMaxValue(2000),
      ).addBooleanOption(option => option
        .setName('withStep')
        .setDescription('Show consecutive moving steps (default: false)')
        .setRequired(false),
      ),
    ).addSubcommand(subcommand => subcommand
      .setName('help')
      .setDescription('Get help on how to use the Tetrlang command'),
    ).addSubcommand(subcommand => subcommand
      .setName('info')
      .setDescription('Get information about the Tetrlang command'),
    ),
]

client.once(Events.ClientReady, async readyClient => {
  console.log(`Discord bot ready! Logged in as ${readyClient.user.tag}`)

  // Register commands globally
  try {
    console.log('Registering slash commands...')
    await readyClient.application?.commands.set(commands)
    console.log('Slash commands registered successfully!')
  } catch(error) {
    console.error('Error registering slash commands:', error)
  }
})

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return

  if (interaction.commandName === 'tetr') {
    let command = ''
    try {
      command = interaction.options.getSubcommand()
      if (command === 'help') {
        const helpMessage =
// eslint-disable-next-line @stylistic/max-len
`## Tetrlang code format (Read more at [README](<https://github.com/harlos0517/tetrlang#tetrlang-code-format>))
The Tetrlang code is composed of three parts:
\`board:order:operations\`
- \`board\` consists of rows from bottom to top, separated by commas.
- Indicate the garbage holes with column numbers 0 to 9
### Order (optional)
- Default available pieces are \`I\`, \`J\`, \`L\`, \`O\`, \`S\`, \`T\`, \`Z\`.
- Specify initial hold piece by prepending the piece and \`|\` (pipe).
### Operations
\`operations\` is a sequence of operations to perform on the board.
- Lock (space): \`;\`
- Hold (shift): \`|\` (only when order is provided)
- Rotation: \`r\` (clockwise), \`z\` (counterclockwise), \`a\` (180 flip)
- Movement: \`<\` (left), \`>\` (right), \`[\` (left to side), \`]\` (right to side)
- Drop: \`.\` (fall down one step), \`_\` (soft drop to bottom)
- If order was not provided, the first operation must be a piece.
## Examples
- no order provided: \`2,,,,-1,-2,,,-3::Jr[;Tr[;S[r_r;Z[_r;\`
- order provided:  \`2,,,,-1,-2,,,-3:S|JTLZ:r[;r[;|[r_r;[_r;\`
- Perfect Clear Opening: \`:I|TSZILJOTSZ:r[;_[;[;];r>>;z];]<;z>;;z_z<;\``
        await interaction.reply({
          content: helpMessage,
          flags: 'Ephemeral',
        })
      } else if (command === 'info') {
        const infoMessage =
`## Tetrlang Bot
- Source code: [GitHub Repository]<https://github.com/harlos0517/tetrlang>)
- Developed by [Harlos](<https://github.com/harlos0517>)
- Discord: \`@harlos_0517\`
- Twitter: [@Harlos_Music](<https://x.com/Harlos_Music>)
- More about me: <https://harlos.me>`
        await interaction.reply({
          content: infoMessage,
          flags: 'Ephemeral',
        })
      } else await handleTetrlangCommand(interaction)
    } catch(error) {
      console.error('Error processing Tetrlang command:', error)

      const errorStr = error instanceof Error ? error.message : String(error)
      const errorMessage = '❌ Error: ' + errorStr

      try {
        await interaction.editReply(errorMessage)
      } catch(replyError) {
        console.error('Error sending error reply: ', replyError)
      }
    }
  }
})

async function handleTetrlangCommand(interaction: ChatInputCommandInteraction) {
  const code = interaction.options.getString('code', true)
  const delay = interaction.options.getInteger('delay')
  const withStep = interaction.options.getBoolean('withStep', false)

  await interaction.deferReply()

  const gifOptions = { delay: delay ?? DELAY_MS, withStep: withStep || false }

  const compiled = compiler(code)
  const gifBuffer = await generateGif(compiled, gifOptions) as Buffer

  // Create attachment and send
  const attachment = new AttachmentBuilder(gifBuffer, { name: 'tetris.gif' })

  await interaction.editReply({
    content: `\`\`\`\n${code}\n\`\`\``,
    files: [attachment],
  })
}

// Login with bot token
const token = process.env.DISCORD_TOKEN
if (!token) {
  console.error('DISCORD_TOKEN environment variable is required')
  process.exit(1)
}

client.login(token).catch(console.error)
