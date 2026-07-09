
# Lenny Bot

Discord Bot mit Ticket-System, temporären Voice Channels und Logging.

[GitHub Repository](https://github.com/seaofdespairrp/Discord-Bot-Vorlage)

## Features

### Ticket-System
- Vollautomatisiertes Ticket-Management
- Erstellung über Slash-Commands oder Buttons
- Automatische Kategorisierung
- Support-Team Integration
- Ticket-Archivierung und Logging

### Temporäre Voice Channels
- Automatische Erstellung privater Sprachkanäle
- Dynamisches Löschen bei Leere
- Kanalkonfiguration durch Nutzer
- Persistente Verwaltung

### Logging
- Event-Logging für wichtige Aktionen
- Nachrichtenänderungen und Löschungen
- Member-Aktivitäten (Joins/Leaves)
- Dedizierter Log-Channel

### Member Management
- Begrüßungs-Events bei neuen Mitgliedern
- Events bei austretenden Mitgliedern
- Automatische Rollen-Zuweisungen (optional)

## Installation

### Voraussetzungen
- Node.js 16.6.0 oder höher
- Discord Server
- Discord Bot Token

### Setup

1. Repository klonen:
   ```bash
   git clone https://github.com/seaofdespairrp/Discord-Bot-Vorlage.git
   cd Discord-Bot-Vorlage
   ```

2. Dependencies installieren:
   ```bash
   npm install
   ```

3. Bot im Discord Developer Portal erstellen:
   - Gehe zu [Discord Developer Portal](https://discord.com/developers/applications)
   - Erstelle eine neue Application
   - Füge einen Bot hinzu
   - Kopiere den Token

4. Umgebungsvariablen einrichten:
   ```bash
   cp .env.example .env
   ```

   Trage deine Werte ein:
   ```env
   TOKEN=dein_bot_token
   CLIENT_ID=deine_client_id
   GUILD_ID=deine_server_id
   TICKET_CATEGORY_ID=id_der_ticket_kategorie
   STAFF_ROLE_ID=id_der_staff_rolle (optional)
   LOG_CHANNEL_ID=id_des_log_channels (optional)
   TEMPVOICE_CHANNEL_ID=id_des_tempvoice_channels (optional)
   ```

5. Commands registrieren:
   ```bash
   npm run deploy-commands
   ```

6. Bot starten:
   ```bash
   npm start
   ```

## Verwendung

### Slash Commands

**`/setup-tickets`**
Richtet das Ticket-System ein und erstellt eine Nachricht mit Buttons zur Ticket-Erstellung.

**`/close-ticket`**
Schließt das aktuelle Ticket und archiviert es.

### Bot Permissions

Der Bot benötigt folgende Berechtigungen:
- Manage Channels
- Manage Messages
- Send Messages
- Embed Links
- Read Message History
- Manage Roles (für Temp Voice)
- Move Members (für Temp Voice)
- View Audit Log

## Projektstruktur

```
lenny-bot/
├── src/
│   ├── index.js              # Haupteinstiegspunkt
│   ├── config.js             # Konfiguration
│   ├── deploy-commands.js    # Slash Command Registrierung
│   ├── store.js              # Datenspeicherung
│   ├── commands/
│   │   ├── close-ticket.js
│   │   └── setup-tickets.js
│   ├── events/
│   │   ├── ready.js
│   │   ├── interactionCreate.js
│   │   ├── guildMemberAdd.js
│   │   ├── guildMemberRemove.js
│   │   ├── voiceStateUpdate.js
│   │   ├── messageDelete.js
│   │   └── messageUpdate.js
│   ├── handlers/
│   │   ├── ticketButtons.js
│   │   └── ticketSelectMenu.js
│   ├── tickets/
│   │   └── ticketManager.js
│   ├── tempvoice/
│   │   └── tempVoiceManager.js
│   └── logging/
│       └── logEmbeds.js
├── data/
│   ├── tempVoiceChannels.json
│   └── tickets.json
├── package.json
├── .env.example
└── README.md
```

## Entwicklung

Watch-Modus:
```bash
npm run dev
```

Commands neu registrieren:
```bash
npm run deploy-commands
```

## Architektur

- Event-basierte Architektur mit Discord.js
- Modulare Struktur für einfache Wartung
- JSON-basierte Datenspeicherung
- Umfassendes Logging aller Events

## Troubleshooting

**Bot antwortet nicht**
- Überprüfe den Token in `.env`
- Stelle sicher, dass alle erforderlichen Permissions gesetzt sind
- Überprüfe die Konsolen-Logs

**Commands werden nicht angezeigt**
- Führe `npm run deploy-commands` aus
- Warte auf Discord Synchronisierung
- Starte den Bot neu

**Tickets werden nicht erstellt**
- Überprüfe, dass `TICKET_CATEGORY_ID` in `.env` gesetzt ist
- Stelle sicher, dass der Bot die Kategorie sehen kann
- Überprüfe die Bot-Permissions

## Lizenz

MIT
