## Next — task manager

## Setup

1. `.env` already exists — edit it and fill in:
   - `DATABASE_URL` — a Postgres connection string. Easiest options: install Postgres locally, run one via Docker, or use a free hosted instance (Neon, Supabase, Railway).
   - `ANTHROPIC_API_KEY` — get one at [platform.claude.com](https://platform.claude.com).
2. Install dependencies (already done): `npm install`
3. Apply the schema to your database:
   ```
   npx prisma migrate dev --name init
   ```
4. Seed a demo project:
   ```
   npx prisma db seed
   ```
5. Run the dev server:
   ```
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind
- Prisma 7 (driver adapter: `@prisma/adapter-pg`) + PostgreSQL
- Claude API (`@anthropic-ai/sdk`) for the "Break Down" feature
- Fractional indexing (`fractional-indexing`) for task ordering — see `src/lib/order.ts`

## Project structure

- `prisma/schema.prisma` — data model (User, Project, Task)
- `prisma/seed.ts` — seeds a demo project
- `src/lib/task-tree.ts` — builds the task tree and finds the "Next Action"
- `src/lib/order.ts` — fractional-index helpers for sibling ordering
- `src/lib/anthropic.ts` — Claude API call for task breakdown
- `src/app/api/**` — REST-ish route handlers (projects, tasks, reorder, breakdown)
- `src/components/TaskApp.tsx` — client-side state + orchestration
- `src/components/TaskRow.tsx` — recursive task tree row
- `src/components/NextActionCard.tsx` — the "Next Action" surface

## Notes

- No auth yet — every request acts as a single seeded demo user (`src/lib/demo-user.ts`).
- Drag-and-drop reordering isn't wired into the UI yet, but the API
  (`PATCH /api/tasks/[taskId]/reorder`) and fractional-index logic are ready for it.
