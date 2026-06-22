# Beacon

Beacon is a LAN-first chat platform with a React/Vite glassmorphism client and an Express, SQLite, JWT, and Socket.IO server.

## Requirements

- Node.js 22.5+ (Node's built-in SQLite is used)
- Devices on the same local network

## Run locally

1. Copy `backend/.env.example` to `backend/.env` and replace `JWT_SECRET`.
2. Install once with `npm install` inside both `backend` and `frontend`.
3. From the `Beacon` root, run `npm run dev`. This starts both the API and Vite; running Vite alone leaves real-time chat offline.
4. Open the Vite network URL from any device on the same LAN. Allow ports 5173 and 8080 through the host firewall if necessary.

The frontend automatically targets port 8080 on the hostname used to open it, so `localhost` is not hard-coded. The server binds to `0.0.0.0`.

## Production

Run `npm run build` in `frontend`, serve `frontend/dist` with a static web server, and start the API with `npm start` in `backend`. Set `CLIENT_ORIGIN` to the exact frontend origin and use a long random `JWT_SECRET`.

## Structure

- `frontend/src/components` — responsive authentication, navigation, chat, profile, notification, and channel UI
- `frontend/src/services/api.js` — authenticated REST client
- `frontend/src/hooks/useChatSocket.js` — authenticated Socket.IO lifecycle
- `backend/src/server.js` — REST API, validation, presence, and real-time events
- `backend/src/auth.js` — JWT middleware
- `backend/migrations` — relational schema and indexes
- `backend/data/beacon.db` — local database generated at runtime (do not commit production data)

Passwords are bcrypt-hashed. Account deletion cascades through connections, memberships, messages, reactions, and notifications. General is seeded automatically.
