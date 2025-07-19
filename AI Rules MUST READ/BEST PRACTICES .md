---
inclusion: always
---

# AuraTask Development Standards

**Project Context**: AuraTask (اورا تسک) is a Persian-language task management application built with Next.js, Supabase, and Prisma.

## Core Principles

### Development Workflow
- **Examine First**: Always check existing folder structure and implementations before coding
- **Quality Over Speed**: Use enterprise-level patterns and 2025 best practices
- **Database-First**: All stateful features require proper data persistence
- **No Duplication**: Reuse existing components and utilities
- **System Awareness**: Consider broader architecture in all decisions

### Git Workflow
- **Branches**: `feature/[ticket-id]-[description]` (max 2 days), `hotfix/[description]`
- **Commits**: `type(scope): description` format (`feat`, `fix`, `chore`, `docs`, `refactor`)
- **PRs**: One logical unit per PR, squash and merge, delete branch after merge

### Package Management (pnpm)
- **Standard**: Use pnpm exclusively for all package operations
- **Installation**: `pnpm install` (never `npm install` or `yarn install`)
- **Adding Dependencies**: `pnpm add <package>` for runtime, `pnpm add -D <package>` for dev
- **Scripts**: `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`
- **Workspace**: Use pnpm workspaces for monorepo structure if needed
- **Lock File**: Always commit `pnpm-lock.yaml`, never `package-lock.json` or `yarn.lock`
- **Performance**: Leverage pnpm's symlink structure and shared store for faster installs

## Next.js Architecture

### Component Strategy
- **Default to Server Components** for data fetching and heavy computation
- **Client Components** only for interactivity: hooks, event handlers, browser APIs
- Mark with `'use client'` only when necessary
- Keep Client Components small and at component tree leaves

### State Management Hierarchy
1. **Server State**: Database via Server Actions (primary source of truth)
2. **URL State**: Search params for UI state (tabs, filters, pagination)
3. **Global UI State**: Zustand for modals, notifications, theme
4. **Local State**: `useState` for simple component state

### Required Files
- `loading.tsx`: Every route with data fetching
- `error.tsx`: Every route for error boundaries

### Data Mutations
- Use Server Actions for all Create/Update/Delete operations
- Never create API routes for internal frontend calls
- Server-side validation with Zod schemas from `lib/types`

## Styling & UI

### Tailwind Standards
- Use utility classes exclusively, minimal custom CSS
- Define all design tokens in `tailwind.config.ts`
- Avoid arbitrary values like `w-[123px]`
- Use `@apply` only in `globals.css` for truly global styles

### Animation Guidelines
- **Framer Motion**: 95% of UI animations (layout, transitions, hover/press)
- **GSAP**: Complex timeline animations
- **React Three Fiber**: 3D elements and WebGL
- Duration: 150-250ms with ease-out or spring physics

### Accessibility Requirements
- Semantic HTML elements (`<nav>`, `<main>`, `<button>`)
- Keyboard accessibility for all interactive elements
- Proper ARIA attributes and focus management

## Database & Backend

### Prisma Standards
- `schema.prisma` is source of truth for database structure
- Use `prisma migrate dev` for all schema changes
- Model names: PascalCase, field names: camelCase

### Supabase Security
- Enable RLS on all tables with default DENY ALL policy
- Create specific policies using `auth.uid()`
- All external API calls server-side only
- Encrypt sensitive data using `lib/encryption.ts`

### Query Optimization
- Use Prisma Client exclusively for type-safe queries
- Avoid N+1 queries with `include` and batching
- Create PostgreSQL VIEWs for complex read operations

## TypeScript Standards

### Type System
- `strict: true` in `tsconfig.json`
- Forbidden: `any` type (use `unknown` with type checking)
- `interface` for object shapes, `type` for unions/intersections
- Meaningful generic parameter names

### Code Organization
- Component Props interfaces in same file as component
- Shared types in `src/lib/types`
- Zod schemas in `src/lib/types/zod-schemas.ts` as single source of truth
- Infer TypeScript types from Zod schemas