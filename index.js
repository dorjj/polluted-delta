const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
  console.error('❌ BOT_TOKEN oder CLIENT_ID fehlt in der .env Datei!');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessagePolls] });

// ---------------------------------------------------------------------------
// Slash Command registrieren
// ---------------------------------------------------------------------------
const commands = [
  new SlashCommandBuilder()
    .setName('pdelta')
    .setDescription('Creates a Commander-Poll for the current week')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

async function registerCommands() {
  try {
    console.log('🔄 Registriere Slash Commands...');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('✅ Slash Commands registriert!');
  } catch (error) {
    console.error('❌ Fehler beim Registrieren der Commands:', error);
  }
}

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------

/** ISO-8601 Kalenderwoche berechnen */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/** Alle 7 Tage der aktuellen Woche (Mo–So) als formatierte Strings zurückgeben */
function getWeekDays() {
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();

  // Montag dieser Woche ermitteln
  const monday = new Date(today);
  const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon, ...
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(today.getDate() + diff);

  return dayLabels.map((label, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${dd}.${mm}. ${label}`;
  });
}

// ---------------------------------------------------------------------------
// Event Handler
// ---------------------------------------------------------------------------
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'pdelta') return;

  const cw = getWeekNumber(new Date());
  const weekDays = getWeekDays();

  try {
    // Native Discord Poll (verfügbar ab discord.js v14.16+)
    await interaction.reply({
      poll: {
        question: { text: `Commander (CW ${cw})` },
        answers: weekDays.map(day => ({ text: day })),
        allow_multiselect: true,
        duration: 168  // 7 Tage (Maximum)
      }
    });
  } catch (error) {
    console.error('❌ Fehler beim Erstellen des Polls:', error);
  }
});

client.once('ready', () => {
  console.log(`✅ Bot online als ${client.user.tag}`);
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
registerCommands();
client.login(TOKEN);
