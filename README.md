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

## Code-Mode Example

The repo now includes a `demo_orders` table plus seed/manipulation scripts so code-mode can work against realistic local data instead of toy JSON.

- Seed `10,000` rows with `bun run db:seed:demo`
- Run `bun run db:manipulate:demo` to apply bulk state changes
- Use the same local `DATABASE_URL` with a `database-server` MCP helper to inspect or reshape data ad hoc

The full walkthrough lives in [galeries/code_mode_postgres.md](/Users/themrb/Documents/personal/ai20k/ai20k-demo/galeries/code_mode_postgres.md).
