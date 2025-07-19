---
inclusion: always
---

# AuraTask Development Blueprint

**Project**: AuraTask (اورا تسک) - Persian todo list and persenoal task management application  
**Stack**: Next.js 15 + TypeScript + Supabase + Prisma + Tailwind CSS

## Core Architecture Principles

### Component Strategy
- **Server Components by default** - Use for data fetching and static rendering
- **Client Components only for interactivity** - Mark with `'use client'` for hooks/events
- Push Client Components to component tree leaves
- No API routes for internal frontend calls - use Server Actions

### Technology Stack
- **Framework**: Next.js 15.4 (App Router)
- **Language**: TypeScript 5.5.3 (strict mode)
- **Package Manager**: pnpm (fast, disk-efficient, strict dependency resolution)
- **Backend**: Supabase + Prisma 6.12.0
- **Styling**: Tailwind CSS 3.4.4
- **State**: Zustand for global UI state
- **Animations**: Framer Motion (primary), GSAP (complex), React Three Fiber (3D)
- **UI Components**: Hybrid approach (shadcn/ui + specialized libraries)
- **AI**: Google Gemini API (server-side only)
## Design System & Styling

### Layout Structure
- **Desktop (≥1280px)**: 3-column layout (Sidebar ~280px | Main Content | Contextual Panel)
- **Tablet (≥768px)**: 2-column layout (Sidebar + merged content)
- **Mobile (<768px)**: Single column with Bottom Tab Bar + FAB

### Styling Standards
- **Corner Radius**: `rounded-xl` to `rounded-2xl` consistently
- **Padding**: Cards use `p-4` to `p-6` for generous spacing
- **Borders**: Semi-transparent `border-white/10` in dark mode
- **Shadows**: `shadow-md` for depth, custom accent glow for primary elements
- **Glassmorphism**: `backdrop-filter: blur(12px)` for modals/overlays

### Typography & Icons
- **Font**: "vazirmtn" (Persian support)
- **Hierarchy**: `text-3xl font-bold` (H1) → `text-sm text-muted-foreground` (body)
- **Icons**: Lucide React exclusively

### Theme System
All themes support both light/dark modes via CSS variables:
- **Default**: High-contrast black/white, professional
- **Alireza**: Matrix-inspired dark theme with yellow accents, scan-line effects
- **Neda**: Pastel purples/pinks with 3D floating bubbles (React Three Fiber)

### Animation Guidelines
- **Duration**: 150-250ms with ease-out/spring physics
- **Hover Effects**: `hover:scale-105` on primary buttons
- **List Animations**: Framer Motion `AnimatePresence` for enter/exit
- **Complex Animations**: GSAP for timeline-based sequences

### UI Component Libraries
- **Foundation**: shadcn/ui primitives in `src/components/ui`
- **Specialized**: Sonner (toasts), Vaul (drawers), Recharts (charts), @dnd-kit (drag-drop)
- **Custom**: Build unique components from scratch when needed

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Auth route group
│   ├── (app)/            # Protected app routes
│   ├── (admin)/          # Admin routes
│   ├── api/              # API handlers (AI endpoints only)
│   └── layout.tsx        # Root layout
├── components/           # Reusable UI components
│   ├── ai/               # AI-related components
│   ├── animations/       # Animation components
│   ├── auth/             # Authentication components
│   ├── layout/           # Layout components (Header, Sidebar, etc.)
│   ├── settings/         # Settings components
│   ├── tasks/            # Task-related components
│   └── ui/               # shadcn/ui customized components
├── lib/                  # Non-UI utilities
│   ├── actions/          # Server Actions (task.actions.ts, etc.)
│   ├── constants/        # Constants and text strings
│   ├── db/               # Prisma client setup
│   ├── providers/        # React context providers
│   ├── store/            # Zustand global store
│   ├── types/            # TypeScript types and Zod schemas
│   └── utils.ts          # Utility functions
├── styles/               # Global CSS and themes
├── public/               # Static assets
└── middleware.ts         # Auth and route protection
```

## Data Architecture

### Database & Security
- **Prisma**: Single source of truth via `schema.prisma`
- **Row-Level Security (RLS)**: Enabled on all tables, users access only their data
- **Server Actions**: All CRUD operations, no internal API routes for frontend
- **Type Safety**: End-to-end with TypeScript + Zod validation

### State Management Hierarchy
1. **Server State**: Database via Server Actions (primary)
2. **Global UI State**: Zustand store (`lib/store/`) for modals, theme, notifications
3. **URL State**: Search params for filters, pagination, tabs
4. **Local State**: `useState` for simple component state

## Key Pages & Features

### Authentication Flow
- **Welcome Screen**: Guest option + Sign In link
- **Onboarding**: 3-step modal for feature intro + theme selection
- **Auth Page**: Google Sign-in prominent button
- **Post-Auth Setup**: Username + avatar selection (mandatory)

### Main Dashboard (/)
**Layout**: 3-column desktop layout
- **Sidebar**: Logo, navigation (Dashboard/Timeline/Leaderboard/Settings), user profile, theme toggle
- **Main Content**: Welcome header, stat cards (Tasks Today/Streak/Aura Points), task groups with AI-suggested emojis
- **Contextual Panel**: Calendar + Smart Info Pods (Top Priority/Quick Win/Upcoming Task)

### Task Details
**Implementation**: Full-screen modal (desktop) or Vaul drawer (mobile)
- **Column 1**: Title, description, status, group, sub-task checklist
- **Column 2**: AI scores (Importance/Urgency), dates, activity log

### Settings Panel
**Implementation**: Tabbed modal
- **Profile**: Username/avatar management
- **Appearance**: Theme selector with visual previews
- **AI**: Preference slider (Importance vs Urgency weight), Gemini API key management
- **Account**: Sign out, delete account

### Leaderboard Page
- User's rank/points prominently displayed
- Ranked user list with special treatment for top 3 (gold/silver/bronze effects)

### Admin Dashboard (/admin)
- Metrics dashboard with Recharts visualizations
- Gemini API key pool management table

## Development Standards

### Code Quality
- **TypeScript strict mode** - No `any` types allowed
- **Server Actions** - All database mutations, no internal API routes
- **Zod validation** - All form inputs and API responses
- **Error boundaries** - `error.tsx` for every route with data fetching
- **Loading states** - `loading.tsx` for every data-fetching route

### Performance Requirements
- **Server-first architecture** - Minimize client-side JavaScript
- **Intelligent caching** - Leverage Next.js caching strategies
- **SEO optimized** - Proper meta tags, structured data
- **Instant feel** - Sub-200ms interaction feedback

### Security Requirements
- **Row-Level Security** - All Supabase tables must have RLS enabled
- **API key protection** - Gemini API calls server-side only
- **Input validation** - Server-side validation for all user inputs
- **Auth middleware** - Protect all app routes via `middleware.ts`