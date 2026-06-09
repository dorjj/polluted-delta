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
    .setDescription('Erstellt einen Commander-Poll für die aktuelle Woche')
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

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getWeekDays() {
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();

  const monday = new Date(today);
  const dayOfWeek = today.getDay();
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
    await fetch(
        `https://discord.com/api/v10/interactions/${interaction.id}/${interaction.token}/callback`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 5, data: { flags: 64 } })
        }
    );

    const res = await fetch(
        `https://discord.com/api/v10/webhooks/${CLIENT_ID}/${interaction.token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bot ${TOKEN}`
          },
          body: JSON.stringify({
            poll: {
              question: { text: `Commander (CW ${cw})` },
              answers: weekDays.map(day => ({ poll_media: { text: day } })),
              allow_multiselect: true,
              duration: 168
            }
          })
        }
    );

    const data = await res.json();
    if (!res.ok) {
      console.error('❌ Discord API Fehler:', JSON.stringify(data, null, 2));
    } else {
      console.log('✅ Poll erstellt, allow_multiselect:', data?.poll?.allow_multiselect);
    }
  } catch (error) {
    console.error('❌ Fehler:', error);
  }
});

client.once('clientReady', () => {
  console.log(`✅ Bot online als ${client.user.tag}`);
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
registerCommands();
client.login(TOKEN);
