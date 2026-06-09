# !Polluted Delta – Discord Poll Bot

Discord-Bot zur wöchentlichen Terminfindung für Commander-Runden. Erstellt per `/pdelta` automatisch einen Poll mit den Wochentagen der aktuellen Kalenderwoche.

## Voraussetzungen

- Node.js 18+
- Ein Discord-Bot-Account ([discord.com/developers](https://discord.com/developers/applications))

## Setup

### 1. Repository klonen & Dependencies installieren

```bash
git clone https://github.com/DEIN-USERNAME/polluted-delta.git
cd polluted-delta
npm install
```

### 2. Umgebungsvariablen konfigurieren

```bash
cp .env.example .env
```

`.env` öffnen und die Werte eintragen:

```env
BOT_TOKEN=dein_bot_token
CLIENT_ID=deine_application_id
```

**Werte findest du im [Discord Developer Portal](https://discord.com/developers/applications):**
- `BOT_TOKEN` → Deine App → **Bot** → Token
- `CLIENT_ID` → Deine App → **General Information** → Application ID

### 3. Bot starten

```bash
npm start
```

## Bot auf Server einladen

Im Developer Portal unter **OAuth2 → URL Generator**:
- Scope: `bot`, `applications.commands`
- Permissions: `Send Messages`, `Read Messages/View Channels`, `Add Reactions`

Generierten Link im Browser öffnen und Server auswählen.

## Verwendung

```
/pdelta
```

Erstellt einen Poll der Form:

```
📅 Commander (CW 24)

1️⃣ 09.06. Mon
2️⃣ 10.06. Tue
3️⃣ 11.06. Wed
4️⃣ 12.06. Thu
5️⃣ 13.06. Fri
6️⃣ 14.06. Sat
7️⃣ 15.06. Sun

(Mehrfachauswahl möglich)
```

## Deployment

Empfohlene Hosting-Optionen:

| Anbieter | Kosten | Hinweis |
|---|---|---|
| [Railway](https://railway.app) | ~$5/Monat | Einfachstes Git-Deploy |
| [Render](https://render.com) | kostenlos* | *Schläft bei Inaktivität |
| [Hetzner VPS](https://hetzner.com) | ~4€/Monat | Volle Kontrolle |

Umgebungsvariablen (`BOT_TOKEN`, `CLIENT_ID`) im Hosting-Dashboard als **Environment Variables** setzen – niemals in den Code oder ins Repo schreiben.
