# RA Verifier (Officer Verify)

Prototype officer app for scanning **myRA** driving licence verification QR codes.

## Demo login

| Officer ID   | Password  |
|--------------|-----------|
| NAMPOL-1001  | demo1234  |
| RA-2001      | demo1234  |

## Demo licence (matches myRA design app)

- **NAM 879912 PE84** — Peter Kyle, code B

## Run

```bash
cd "Officer Verify"
npm install
npx expo start
```

Scan the QR from myRA → Driving Licence → **Officer verification only**.

## Prototype scope

- Mock registry (no backend)
- Parses `ra-licence-verify` JSON from citizen app QR
- Token expiry + single-use simulation
- Manual lookup fallback
