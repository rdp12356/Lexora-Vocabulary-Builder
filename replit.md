# Workspace

## Overview

npm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

-- **Monorepo tool**: npm workspaces
- **Node.js version**: 24
-- **Package manager**: npm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `npm run typecheck --workspaces --if-present` — full typecheck across all packages
- `npm run build --workspaces --if-present` — typecheck + build all packages
- `npm --workspace=@workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `npm --workspace=@workspace/db run push` — push DB schema changes (dev only)
- `npm --workspace=@workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
