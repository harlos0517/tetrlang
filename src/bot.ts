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
import { GifOptions } from 'sharp'
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

// Register slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('tetr')
    .setDescription('Generate a Tetris GIF from Tetrlang code')
    .addStringOption(option =>
      option
        .setName('code')
        .setDescription('The Tetrlang code to compile')
        .setRequired(true),
    )
    .addIntegerOption(option =>
      option
        .setName('delay')
        .setDescription('Frame delay in milliseconds (default: 250)')
        .setRequired(false)
        .setMinValue(50)
        .setMaxValue(2000),
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

  if (interaction.commandName === 'tetr')
    await handleTetrlangCommand(interaction)
})

async function handleTetrlangCommand(interaction: ChatInputCommandInteraction) {
  const code = interaction.options.getString('code', true)
  const delay = interaction.options.getInteger('delay') || DELAY_MS

  await interaction.deferReply()

  try {
    const gifOptions: GifOptions = {
      delay,
      loop: 0,
    }

    const compiled = compiler(code)
    const gifBuffer = await generateGif(compiled, gifOptions) as Buffer

    // Create attachment and send
    const attachment = new AttachmentBuilder(gifBuffer, { name: 'tetris.gif' })

    await interaction.editReply({
      files: [attachment],
    })
  } catch(error) {
    console.error('Error processing Tetrlang command:', error)

    const errorStr = error instanceof Error ? error.message : String(error)
    const errorMessage = '❌ Error: ' + errorStr

    await interaction.editReply(errorMessage)
  }
}

// Login with bot token
const token = process.env.DISCORD_TOKEN
if (!token) {
  console.error('DISCORD_TOKEN environment variable is required')
  process.exit(1)
}

client.login(token).catch(console.error)
