# Organic Chemistry Molecule Builder

A drag-and-drop organic chemistry molecule builder built with React + Express.

## Prerequisites

- Node.js 18+
- npm 8+ (workspaces support)

## Setup

Install all dependencies from the repo root:

```bash
npm install
```

## Running

Start the backend and frontend in separate terminals.

**Backend** (port 3001):
```bash
cd server-application
npm run dev
```

**Frontend** (port 5173):
```bash
cd web-application
npm run dev
```

## Other Commands

| Command | Location | Description |
|---|---|---|
| `npm run build` | `server-application/` | Compile server to `dist/` |
| `npm start` | `server-application/` | Run compiled server |
| `npm run typecheck` | `server-application/` | Type-check without emitting |
| `npm run build` | `web-application/` | Production Vite build |
| `npm run lint` | `web-application/` | Run ESLint |

## API

Base URL: `http://localhost:3001`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/molecules` | List all molecules |
| GET | `/api/molecules/:id` | Get a molecule |
| POST | `/api/molecules` | Save a molecule |
| DELETE | `/api/molecules/:id` | Delete a molecule |

## Project Structure

```
├── shared/               # Shared TypeScript types (@app/shared)
├── web-application/      # React + Vite frontend
└── server-application/   # Express backend
```
