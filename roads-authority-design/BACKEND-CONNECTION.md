# Backend & Admin Connection

The design app is wired to the same backend and admin as the main app.

## Backend (API)

- **Default URL (dev):** `http://localhost:5000/api`
- **Config:** `config/env.js` — change `API_BASE_URL` for your environment.

### Run the backend

From the **repo root**:

```bash
cd backend
npm install
npm run dev
```

Backend runs on port **5000** by default. For a physical device, use your machine’s IP (e.g. `http://192.168.1.x:5000/api`) in `config/env.js`.

## Admin panel

- Admin is a separate web app that uses the same backend API.
- Run from **repo root**: `cd admin && npm install && npm run dev`
- Feedback, pothole reports, and chatbot interactions are managed in the admin panel.

## What’s connected

| Feature            | Backend route              | Admin                         |
|--------------------|---------------------------|-------------------------------|
| Sign in / Sign up  | `/api/app-users/*`        | User management               |
| Feedback           | `POST /api/feedback`      | Feedback list / status        |
| Report road damage | `POST /api/pothole-reports` | Pothole reports management  |
| My reports         | `GET /api/pothole-reports/my-reports` | Same as above        |
| Chat               | `POST /api/chatbot/query`  | Chatbot interactions         |

## New dependency

- **expo-secure-store** — used for auth tokens and device ID. Install with:

  ```bash
  cd roads-authority-design
  npm install
  ```

Then run the app with `npx expo start`.
