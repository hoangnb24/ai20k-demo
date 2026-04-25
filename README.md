# ai20k-demo

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines Next.js, Self, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Shared UI package** - shadcn/ui primitives live in `packages/ui`
- **Drizzle** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
bun install
```

## Database Setup

This project uses PostgreSQL with Drizzle ORM.

1. Start the bundled PostgreSQL container:

```bash
bun run db:start
```

2. Update your `apps/web/.env` file if you need a non-default connection. The checked-in local Docker setup uses:

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai20k-demo
```

3. Apply the schema to your database:

```bash
bun run db:push
```

4. Optional: seed a large local dataset for testing and code-mode experiments:

```bash
bun run db:seed:demo
```

5. Optional: run the bundled bulk-manipulation example:

```bash
bun run db:manipulate:demo
```

Then, run the development server:

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the fullstack application.

## UI Customization

React web apps in this stack share shadcn/ui primitives through `packages/ui`.

- Change design tokens and global styles in `packages/ui/src/styles/globals.css`
- Update shared primitives in `packages/ui/src/components/*`
- Adjust shadcn aliases or style config in `packages/ui/components.json` and `apps/web/components.json`

### Add more shared components

Run this from the project root to add more primitives to the shared UI package:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

Import shared components like this:

```tsx
import { Button } from "@ai20k-demo/ui/components/button";
```

### Add app-specific blocks

If you want to add app-specific blocks instead of shared primitives, run the shadcn CLI from `apps/web`.

## Project Structure

```
ai20k-demo/
├── apps/
│   └── web/         # Fullstack application (Next.js)
├── packages/
│   ├── ui/          # Shared shadcn/ui components and styles
│   └── db/          # Database schema & queries
```

## Available Scripts

- `bun run dev`: Start all applications in development mode
- `bun run build`: Build all applications
- `bun run dev:web`: Start only the web application
- `bun run check-types`: Check TypeScript types across all apps
- `bun run db:push`: Push schema changes to database
- `bun run db:generate`: Generate database client/types
- `bun run db:migrate`: Run database migrations
- `bun run db:studio`: Open database studio UI
- `bun run db:seed:demo`: Seed the `demo_orders` table with a large local dataset
- `bun run db:manipulate:demo`: Run a bulk update example against `demo_orders`
- `bun run db:start`: Start the local PostgreSQL Docker container
- `bun run db:stop`: Stop the local PostgreSQL Docker container
- `bun run db:down`: Stop the container and remove the Docker Compose stack

## VPS Demo Stack

The repo includes a production-oriented Docker Compose stack for a single VPS. It keeps the deployment path simple: GitHub Actions builds and pushes the `web` image to GHCR, then SSH runs Compose on the server.

1. Copy the stack files to the VPS and create the production env file:

```bash
cp .env.prod.example .env.prod
```

2. Fill in `DOMAIN`, `ACME_EMAIL`, app secrets, database credentials, and Grafana admin credentials in `.env.prod`. The app expects the production database URL to point at the Compose service host:

```bash
DATABASE_URL=postgresql://ai20k_demo:change-me@postgres:5432/ai20k_demo
```

3. Start the stack:

```bash
docker compose --env-file .env.prod -f compose.prod.yml up -d
```

The public routes are:

- `https://app.<DOMAIN>` -> Next.js app
- `https://grafana.<DOMAIN>` -> Grafana with Prometheus and Loki datasources provisioned
- `https://portainer.<DOMAIN>` -> Portainer UI

The stack also runs Postgres, Traefik, Prometheus, Loki, Alloy, node-exporter, and cAdvisor. The app exposes `/api/internal/health` and `/api/internal/metrics` for container health checks and internal Prometheus scraping; Traefik does not route `/api/internal/*` publicly.

To enable image update visibility without automatic restarts, run the optional DIUN profile:

```bash
docker compose --env-file .env.prod -f compose.prod.yml --profile updates up -d diun
```

### GitHub Actions Deploy

The workflow at `.github/workflows/deploy-vps.yml` builds `ghcr.io/<owner>/<repo>/web` on pushes to `master` or `main`, then deploys the exact SHA-tagged image over SSH.

Required repository secrets:

- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`
- `VPS_STACK_PATH`

Optional repository secrets:

- `VPS_PORT` defaults to `22`
- `GHCR_USERNAME` and `GHCR_TOKEN` are needed only if the VPS must authenticate to pull the GHCR package

The deploy command run on the VPS is:

```bash
WEB_IMAGE=ghcr.io/<owner>/<repo>/web:sha-<commit-sha> docker compose --env-file .env.prod -f compose.prod.yml pull web
WEB_IMAGE=ghcr.io/<owner>/<repo>/web:sha-<commit-sha> docker compose --env-file .env.prod -f compose.prod.yml up -d --remove-orphans
```

## Code-Mode Example

The repo now includes a `demo_orders` table plus seed/manipulation scripts so code-mode can work against realistic local data instead of toy JSON.

- Seed `10,000` rows with `bun run db:seed:demo`
- Run `bun run db:manipulate:demo` to apply bulk state changes
- Use the same local `DATABASE_URL` with a `database-server` MCP helper to inspect or reshape data ad hoc

The full walkthrough lives in [galeries/code_mode_postgres.md](/Users/themrb/Documents/personal/ai20k/ai20k-demo/galeries/code_mode_postgres.md).
