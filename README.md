# RS Fahrzeugsystem Frontend

React + Vite + TypeScript Frontend für dein Backend unter `RS.Fahrzeugsystem.Api`.

## Start

1. `.env.example` nach `.env` kopieren
2. API URL setzen:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

3. Pakete installieren:

```bash
npm install
```

4. Dev-Server starten:

```bash
npm run dev
```

## Aktuell enthalten

- Login mit JWT
- Token-Speicherung im LocalStorage
- Geschützte Bereiche
- Dashboard
- Kundenliste + Kunde anlegen
- Fahrzeugliste + Fahrzeug anlegen
- Labels-Übersicht
- Zentrale API-Anbindung per Axios

## Erwartete Backend-Endpunkte

- `POST /auth/login`
- `GET /auth/me`
- `GET /customers`
- `POST /customers`
- `GET /vehicles`
- `POST /vehicles`
- `GET /labels`

## Nächste Ausbaustufen

- Kunden bearbeiten
- Fahrzeuge bearbeiten
- Label-Zuweisung
- Fahrzeugdetailseite
- Historie / Teile / KM-Pflicht im UI
- Benutzer / Rechteverwaltung
