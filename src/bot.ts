import { generateGif } from '@/gif'
import { t, tMap } from '@/i18n'
import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  Client,
  Events,
  GatewayIntentBits,
  Locale,
  SlashCommandBuilder,
} from 'discord.js'
import dotenv from 'dotenv'
import compiler from './compiler'

dotenv.config()

const DELAY_MS = 250

const COMMAND = 'tetr'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

const commands = [
  new SlashCommandBuilder().setName(COMMAND)
    .setDescription(t('title'))
    .setDescriptionLocalizations(tMap('title'))
    .addSubcommand(subcommand => subcommand
      .setName('gen')
      .setDescription(t('gen', Locale.EnglishUS))
      .setDescriptionLocalizations(tMap('gen'))
      .addStringOption(option => option
        .setName('code')
        .setDescription(t('code', Locale.EnglishUS))
        .setDescriptionLocalizations(tMap('code'))
        .setRequired(true)
        .setMaxLength(256),
      ).addIntegerOption(option => option
        .setName('delay')
        .setDescription(t('delay', Locale.EnglishUS, DELAY_MS))
        .setDescriptionLocalizations(tMap('delay', DELAY_MS))
        .setRequired(false)
        .setMinValue(100)
        .setMaxValue(2000),
      ).addBooleanOption(option => option
        .setName('with_step')
        .setDescription(t('withStep', Locale.EnglishUS))
        .setDescriptionLocalizations(tMap('withStep'))
        .setRequired(false),
      ),
    ).addSubcommand(subcommand => subcommand
      .setName('help')
      .setDescription(t('helpDesc', Locale.EnglishUS))
      .setDescriptionLocalizations(tMap('helpDesc')),
    ).addSubcommand(subcommand => subcommand
      .setName('info')
      .setDescription(t('infoDesc', Locale.EnglishUS))
      .setDescriptionLocalizations(tMap('infoDesc')),
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

  if (interaction.commandName === COMMAND) {
    try {
      const command = interaction.options.getSubcommand()
      if (command === 'help') {
        await interaction.reply({
          content: t('help', interaction.locale),
          flags: 'Ephemeral',
        })
      } else if (command === 'info') {
        await interaction.reply({
          content: t('info', interaction.locale),
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
  const withStep = interaction.options.getBoolean('with_step', false)

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
