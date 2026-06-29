# Christiano Vincenti Property Management

> Luxury Malta vacation rental platform — full-stack monorepo with Firebase backend, Guesty PMS integration, and React frontend.

![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Firebase](https://img.shields.io/badge/Firebase-backend-FFCA28?logo=firebase) ![React](https://img.shields.io/badge/React-frontend-61DAFB?logo=react)

## What it does

End-to-end property management and direct-booking platform for luxury Malta accommodations. Guests can browse properties, check availability, and book directly. Owners get a management portal. The backend syncs with Guesty PMS for reservation management.

## Architecture

Monorepo with clearly separated concerns:

```
apps/         # Frontend applications
backend/      # Backend services
frontend/     # Main guest-facing React app
functions/    # Firebase Cloud Functions
packages/     # Shared packages
```

## Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| Backend | Firebase (Firestore + Cloud Functions) |
| Auth | Firebase Auth |
| Database | Firestore |
| Storage | Firebase Storage |
| PMS | Guesty Open API |
| Hosting | Firebase Hosting |

## Getting Started

```bash
# Install
bun install

# Configure environment
cp .env.example .env.local

# Start Firebase emulators
firebase emulators:start

# Start dev server
bun dev
```

## Security Rules

- `firestore.rules` — Firestore read/write access rules
- `storage.rules` — Firebase Storage access rules

---

Built by [Cerison Automation](https://github.com/CerisonAutomation) · Malta 🇲🇹
