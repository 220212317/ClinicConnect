# ClinicConnect

A React Native mobile app connecting patients with healthcare providers — built with Expo and Supabase.

## Tech Stack

- **React Native** 0.83.6 + **Expo** SDK 55
- **TypeScript** 5.9
- **Supabase** — Auth, PostgreSQL, Realtime, Storage
- **React Navigation** 6.x

## Prerequisites

- Node.js 18+
- Expo CLI
- Supabase account (free tier works)
- Android Studio / Xcode (for emulators)

## Getting Started

**1. Clone and install**

Clone the repo (the one you forked) and navigate to it:

```bash
git clone https://github.com/yourusername/ClinicConnect.git
```

Then navigate into the project folder. For example, if you cloned it to your Desktop (umzekelo, ukuba uyiclone kwiDesktop):

```bash
cd Desktop
cd ClinicConnect
npm install
```

**2. Set up environment variables**

```bash
cp .env.example .env
# Add your Supabase URL and anon key:
# EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**3. Start the app**

First download and install **Expo Go SDK 55** on your phone, then run:

```bash
npx expo start
```

Scan the QR code with Expo Go.

## Features

**Patients** — Book/manage appointments, view medical records, find nearby clinics, receive notifications

**Staff** — Manage patient queue, record visit notes, view daily schedule

**Admin** — Manage clinics, staff, time slots, and view analytics

**Emergency** — Real-time alerts, location tracking, first responder dispatch

## Navigation Flow

![ClinicConnect Navigation Flow](https://github.com/220212317/ClinicConnect/blob/master/clinicconnect_navigation_flow.svg)

## Troubleshooting

**Can't log in** — Disable email confirmation in Supabase Dashboard → Authentication → Settings for local testing.

**Expo SDK mismatch** — Run `npx expo install --fix`.

**Build errors** — Run `npx expo start --clear`.

---

Ndicinga this guide will help you get started.

## License

MIT
