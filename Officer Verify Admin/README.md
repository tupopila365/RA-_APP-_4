# RA Verify Console

Standalone **operations website** for digital driving licence verification.  
Separate from the legacy RA content admin — built for NAMPOL / RA ops staff.

## Design

- Dark operations console aesthetic (navy, RA cyan accent, status colours)
- Command Center with live activity stream
- Officers workforce, verification audit log, incidents kanban, registry lookup, system settings

## Demo login

| Email | Password |
|-------|----------|
| `ops@ra.org.na` | `verify2026` |

## Run locally

```bash
cd "Officer Verify Admin"
npm install
npm run dev
```

Open **http://localhost:5174**

## Prototype scope

- Mock data only (no backend)
- Aligns with **Officer Verify** mobile app and **myRA** citizen QR format
- Sample licence: **NAM 879912 PE84** (Peter Kyle)

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- React Router
