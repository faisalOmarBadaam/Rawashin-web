# Rawshin Platform – Frontend

Rawshin is a digital platform designed to manage and organize client-based services through a modern, scalable web application.

The platform focuses on simplicity, reliability, and adaptability, with strong support for Arabic-first (RTL) user interfaces and enterprise-ready architecture.

This repository contains the **frontend application** of the Rawshin Platform.

---

## About Rawshin

Rawshin aims to provide a unified system for managing different types of users such as clients, merchants, and partners through a clean and structured digital experience.

The platform is built to support:
- Client and account management
- Role-based access and authentication
- Financial and transactional workflows
- Scalable dashboards and data-driven views
- Integration with backend services and APIs

Rawshin is designed with real-world operational needs in mind, prioritizing clarity, consistency, and long-term maintainability.

---

## Technology Stack

- **Next.js** (App Router)
- **TypeScript**
- **Material UI (MUI)** with full RTL support
- **Zustand** for global state management
- **React Query** for API data fetching and caching
- **React Hook Form + Zod** for form handling and validation
- **Iconify** for icon management

---

## Getting Started

Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

## Analytics (PostHog)

Add the following environment variables to your local `.env`:

```bash
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_POSTHOG_ENABLED=
NEXT_PUBLIC_POSTHOG_RECORDING_ENABLED=false
NEXT_PUBLIC_POSTHOG_DEBUG=false
```

Notes:
- If `NEXT_PUBLIC_POSTHOG_ENABLED` is empty, analytics is enabled only in production.
- Set `NEXT_PUBLIC_POSTHOG_ENABLED=true` to test analytics in development.
- Session recording stays disabled unless `NEXT_PUBLIC_POSTHOG_RECORDING_ENABLED=true`.
- Performance checks:
  - `pnpm perf:lighthouse`
  - `pnpm analyze:bundle`
