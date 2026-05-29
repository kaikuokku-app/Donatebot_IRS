const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  Routes,
  REST,
  EmbedBuilder
} = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

let totalMoney = 0;
let donors = {};

const commands = [
  new SlashCommandBuilder()
    .setName('donate')
    .setDescription('Donate vào quỹ')
    .addIntegerOption(option =>
      option.setName('money')
        .setDescription('Số tiền')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('quy')
    .setDescription('Xem tổng quỹ'),

  new SlashCommandBuilder()
    .setName('topdonate')
    .setDescription('Top donate')
]
.map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log('Slash commands loaded');
  } catch (err) {
    console.log(err);
  }
})();

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'donate') {
    const money = interaction.options.getInteger('money');

    totalMoney += money;

    const userId = interaction.user.id;

    if (!donors[userId]) donors[userId] = 0;
    donors[userId] += money;

    const embed = new EmbedBuilder()
      .setTitle('💰 Donate thành công')
      .setDescription(
        `👤 ${interaction.user}\n` +
        `💵 ${money.toLocaleString()}đ\n\n` +
        `🏦 Tổng quỹ: ${totalMoney.toLocaleString()}đ`
      );

    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'quy') {
    await interaction.reply(
      `🏦 Tổng quỹ hiện tại: ${totalMoney.toLocaleString()}đ`
    );
  }

  if (interaction.commandName === 'topdonate') {

    const sorted = Object.entries(donors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    let text = '';

    sorted.forEach((d, i) => {
      text += `${i + 1}. <@${d[0]}> — ${d[1].toLocaleString()}đ\n`;
    });

    await interaction.reply(
      text || 'Chưa có donate'
    );
  }
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(TOKEN);
