# Stock Monitor — Real-Time Stock Monitoring & Discord Alert System

A full-stack system that monitors stock tickers, evaluates custom alert rules, and sends notifications to Discord when conditions are met.

## Architecture

```
stock-monitor/
├── backend/          Node.js + Express + Prisma + WebSocket
├── frontend/         React + TypeScript + Vite
├── docker/           Docker configs
├── docker-compose.yml
└── .env.example
```

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Backend     | Node.js, Express, Prisma ORM     |
| Frontend    | React, TypeScript, Vite           |
| Database    | PostgreSQL                        |
| Real-time   | WebSocket (ws)                    |
| Alerts      | Discord Webhooks                  |
| Stock Data  | Alpha Vantage (with mock fallback)|

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Discord webhook URL (optional)

### 1. Environment

```bash
cp .env.example .env
# Edit .env with your values
```
`
### 2. Database

```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Backend

```bash
cd backend
npm run dev
# API: http://localhost:3001
# WS:  ws://localhost:3001
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
# UI: http://localhost:5173
```

### Docker

```bash
docker-compose up --build
```

## API Endpoints

| Method | Path                    | Description              |
|--------|-------------------------|--------------------------|
| GET    | /api/tickers            | List tracked tickers     |
| POST   | /api/tickers            | Add ticker               |
| DELETE | /api/tickers/:symbol    | Remove ticker            |
| GET    | /api/alerts/rules       | List alert rules         |
| POST   | /api/alerts/rules       | Create alert rule        |
| PATCH  | /api/alerts/rules/:id   | Toggle rule on/off       |
| DELETE | /api/alerts/rules/:id   | Delete rule              |
| GET    | /api/alerts/history     | Alert event log          |
| GET    | /api/prices/:symbol     | Price history            |

## Alert Rule Types

- `ABOVE_PRICE` — triggers when price exceeds threshold
- `BELOW_PRICE` — triggers when price drops below threshold
- `PCT_CHANGE` — triggers on % change from previous close
- `VOLUME_SPIKE` — triggers when volume exceeds multiplier × average

## WebSocket Events

```json
{ "type": "price_update", "data": { "symbol": "AAPL", "price": 182.50 } }
{ "type": "alert_triggered", "data": { "rule": "...", "symbol": "..." } }
```

## License

MIT
