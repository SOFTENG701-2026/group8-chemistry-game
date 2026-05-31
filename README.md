# Lewis Lab

An interactive organic chemistry learning app built with React + Express.

## How to Run the Application

Lewis Lab has two parts:

- `server-application/`: Express backend API
- `web-application/`: React + Vite frontend

Run the backend and frontend in two separate terminals.

## Prerequisites

- Node.js 18+
- npm 8+ (workspaces support)

## 1. Install Dependencies

From the project root, install all workspace dependencies:

```bash
npm install
```

## 2. Start the Backend

In the first terminal:

```bash
cd server-application
npm run dev
```

The backend runs at:

```text
http://localhost:3001
```

You can check that it is running by opening:

```text
http://localhost:3001/health
```

## 3. Start the Frontend

In a second terminal:

```bash
cd web-application
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

Open that URL in your browser to use Lewis Lab.

## Useful Commands

Run these commands from inside the listed folder.

| Folder | Command | Description |
|---|---|---|
| `server-application/` | `npm run dev` | Start the backend in development mode |
| `server-application/` | `npm run build` | Compile the backend to `dist/` |
| `server-application/` | `npm start` | Run the compiled backend |
| `server-application/` | `npm run typecheck` | Type-check the backend |
| `web-application/` | `npm run dev` | Start the frontend development server |
| `web-application/` | `npm run build` | Build the frontend for production |
| `web-application/` | `npm run preview` | Preview the production frontend build |
| `web-application/` | `npm run lint` | Run frontend linting |

## Troubleshooting

If `npm install` fails, check that you are using Node.js 18 or newer:

```bash
node --version
```

If the frontend opens but progress or molecule API features do not work, make sure the backend is also running on port `3001`.

If port `5173` is already in use, Vite may choose another port. Use the URL printed in the frontend terminal.

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
