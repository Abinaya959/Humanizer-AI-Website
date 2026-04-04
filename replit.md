# Humanizer AI Workspace

## Overview

pnpm workspace monorepo using TypeScript. A full-stack SaaS application called "Humanizer AI" that transforms AI-generated text into natural, human-like writing.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: MongoDB (Mongoose) via MONGO_URI secret
- **Frontend**: React + Vite (Tailwind CSS, shadcn/ui)
- **Authentication**: JWT (stored in localStorage as "humanizer_token")
- **Payments**: Stripe Checkout (INR pricing: ₹49 Basic, ₹99 Pro)
- **AI**: OpenAI GPT-4o-mini for text humanization
- **Validation**: Zod (`zod/v4`)
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/humanizer-ai run dev` — run frontend locally

## Artifacts

- **Frontend**: `artifacts/humanizer-ai/` — React + Vite app at `/`
- **API Server**: `artifacts/api-server/` — Express API at `/api`

## Frontend Pages

- `/` — Home: text humanizer tool (input → output)
- `/login` — Email/password login
- `/register` — User registration
- `/pricing` — Plans: Basic (₹49) and Pro (₹99)
- `/payment-success` — Post-Stripe success redirect
- `/payment-cancel` — Post-Stripe cancel redirect

## API Routes

- `POST /api/auth/register` — register new user
- `POST /api/auth/login` — login
- `GET /api/user/me` — get current user (JWT protected)
- `POST /api/humanize` — humanize text (JWT + usage limit check)
- `POST /api/payments/create-checkout-session` — create Stripe checkout
- `POST /api/payments/webhook` — Stripe webhook handler

## Environment Secrets Required

- `MONGO_URI` — MongoDB Atlas connection string
- `OPENAI_API_KEY` — OpenAI API key
- `STRIPE_SECRET_KEY` — Stripe secret key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `SESSION_SECRET` — JWT signing secret

## MongoDB Atlas Setup

**Important**: Add `0.0.0.0/0` to the IP allowlist in MongoDB Atlas Network Access to allow connections from Replit's dynamic IPs.

## Notes

- Stripe integration was not set up via Replit integrations — credentials stored directly as secrets.
- Free users get 3 humanizations before being prompted to upgrade.
- JWT tokens stored in localStorage under key "humanizer_token".
