# AeDoit — Minimal Collaborative TODO System

A production-safe, distraction-free, zero-cost collaborative task management system built for speed, security, and simplicity.

---

## 1. Architecture Overview

AeDoit follows a modern full-stack architecture built on Next.js 14 (App Router) and TypeScript:
- **Frontend / PWA**: React 18 with Apple-inspired minimal design aesthetic, custom CSS design tokens, glassmorphic modals, and Web App Manifest / Service Worker caching for PWA functionality.
- **Backend API**: Next.js Server Actions & API routes with Zod schema validation, server-side JWT session authorization, and HTTP-only cookies.
- **Persistence**: SQLite in local development and PostgreSQL in production via Prisma ORM.
- **Real-Time Synchronization**: Server-Sent Events (SSE) stream delivering real-time task mutations (`TASK_CREATED`, `TASK_UPDATED`, `TASK_DELETED`, `TASK_RESTORED`) to all connected clients with a Last-Write-Wins (LWW) conflict policy.
- **Recoverable Deletion**: Soft deletion state preserves tasks in a recoverable Trash view before permanent purge.

---

## 2. Technology Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript 5.6
- **Database & ORM**: SQLite / PostgreSQL with Prisma ORM 5.21
- **Realtime**: Server-Sent Events (SSE) via `EventEmitter`
- **Validation**: Zod 3.23
- **Security**: JOSE (JWT), bcryptjs, HTTP-Only Cookie Sessions, Security Headers (CSP, HSTS, X-Content-Type-Options)
- **Styling**: Vanilla CSS with custom tokens & Apple design system
- **Icons**: Lucide React
- **Testing**: Vitest, JSDOM, Python E2E integration test suite
- **Deployment**: Vercel Hobby Tier + Supabase / Neon PostgreSQL (Total Cost: **₹0 / $0**)

---

## 3. Repository Structure

```
AeDoit/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI workflow
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   └── seed.ts                # Initial workspace seeding script
├── public/
│   ├── manifest.json          # Web App Manifest
│   ├── sw.js                  # PWA Service Worker
│   ├── icon-192.png           # 192x192 App icon
│   └── icon-512.png           # 512x512 App icon
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Authentication API (login, logout, me)
│   │   │   ├── events/        # SSE real-time broadcast stream
│   │   │   ├── health/        # System health check endpoint
│   │   │   └── tasks/         # Tasks CRUD & trash recovery API
│   │   ├── globals.css        # Apple design tokens & global CSS
│   │   ├── layout.tsx         # Root layout with PWA metadata
│   │   ├── login/page.tsx     # Minimalist login workspace
│   │   └── page.tsx           # Home workspace board
│   ├── components/
│   │   ├── Navbar.tsx         # App header & controls
│   │   ├── TaskItem.tsx       # Task card component
│   │   ├── TaskModal.tsx      # Task creation & editing modal
│   │   └── TrashModal.tsx     # Recoverable deletion modal
│   ├── lib/
│   │   ├── auth.ts            # Session JWT & password security
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── events.ts          # SSE event broadcaster
│   │   └── validations.ts     # Zod validation schemas
│   └── middleware.ts          # Server-enforced auth middleware
├── tests/
│   ├── unit/
│   │   ├── taskLogic.test.ts  # Task filtering & LWW unit tests
│   │   └── validations.test.ts# Schema validation unit tests
│   └── setup.ts               # Test runner setup
├── .env.example               # Template environment variables
├── next.config.mjs            # Security headers configuration
├── tsconfig.json              # TypeScript configuration
└── vitest.config.mts          # Vitest testing configuration
```

---

## 4. Database Schema

```prisma
model Task {
  id           String    @id @default(uuid())
  title        String
  description  String?
  dueDate      DateTime?
  assignedUser String?   // "User A" | "User B"
  tags         String    @default("[]") // JSON string array
  groupName    String    @default("Aethron")
  subgroupName String?
  status       String    @default("TODO") // "TODO" | "IN_PROGRESS" | "DONE"
  isStarred    Boolean   @default(false)
  isDeleted    Boolean   @default(false)
  deletedAt    DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([isDeleted, status])
  @@index([groupName, subgroupName])
}

model Group {
  id           String   @id @default(uuid())
  name         String
  parentGroup  String?
  createdAt    DateTime @default(now())

  @@unique([name, parentGroup])
}

model UserIdentity {
  id           String   @id @default(uuid())
  name         String   @unique
  role         String   @default("member")
  createdAt    DateTime @default(now())
}
```

---

## 5. Authentication & Security Model

- **Session Security**: Authenticated sessions issue a signed JWT stored inside an `httpOnly`, `sameSite=lax` cookie (`aedoit_session`).
- **Server Enforcement**: Middleware (`src/middleware.ts`) verifies session tokens server-side before serving protected pages or API routes (`/api/tasks/*`, `/api/events`).
- **Passphrase**: Initial authentication uses a master passphrase defined in environment variable `MASTER_PASSWORD`.

---

## 6. Real-Time Synchronization & Concurrency

- **Engine**: SSE stream (`/api/events`) streams live JSON mutation events.
- **Conflict Resolution**: **Last Write Wins (LWW)** policy. Database `updatedAt` timestamps track latest updates.
- **Resilience**: Client auto-reconnects if SSE stream drops.

---

## 7. API Documentation

| Endpoint | Method | Auth Required | Description |
|---|---|---|---|
| `/api/health` | GET | No | System health check (database & timestamp) |
| `/api/auth/login` | POST | No | Authenticate passphrase and issue session cookie |
| `/api/auth/logout` | POST | Yes | Clear session cookie |
| `/api/auth/me` | GET | Yes | Check session status and current username |
| `/api/tasks` | GET | Yes | Retrieve tasks with filters (`q`, `status`, `group`, `starred`, `assignedUser`) |
| `/api/tasks` | POST | Yes | Create a new task |
| `/api/tasks/[id]` | GET | Yes | Get single task details |
| `/api/tasks/[id]` | PATCH | Yes | Update task attributes, status, star state, or soft-delete |
| `/api/tasks/[id]` | DELETE | Yes | Soft-delete active task or permanently delete trash task |
| `/api/tasks/[id]/restore` | POST | Yes | Restore soft-deleted task from trash |
| `/api/events` | GET | Yes | Server-Sent Events stream for live updates |

---

## 8. PWA Behavior

- Manifest at `/manifest.json`.
- Service worker at `/sw.js` caches static assets for fast loading.
- Desktop and mobile PWA installable prompt supported.

---

## 9. Testing Strategy & Results

1. **Unit Tests (`npm test`)**: 10/10 tests passed (Zod validation, search filtering, LWW state updates).
2. **Type Check (`npm run typecheck`)**: Passed with 0 errors.
3. **Production Build (`npm run build`)**: Next.js App Router static/dynamic route optimization completed.
4. **End-to-End API Test (`scratch/test_e2e.py`)**: Verified health check, login, task creation, soft deletion, and restoration.
5. **Multi-Client Realtime SSE Test (`scratch/test_sse.py`)**: Verified live event broadcast to concurrent client listeners.

---

## 10. Deployment Instructions (Zero Cost)

1. Push repository to GitHub.
2. Link repository to Vercel (Free Hobby Tier).
3. Provision a free PostgreSQL database on Supabase or Neon.
4. Configure environment variables in Vercel settings:
   - `DATABASE_URL`: `postgresql://...`
   - `SESSION_SECRET`: `<32-char-random-key>`
   - `MASTER_PASSWORD`: `<your-passphrase>`
5. Deploy. Total ongoing cost: **₹0**.

---

## 11. Environment Variables

| Variable | Required | Default / Description |
|---|---|---|
| `DATABASE_URL` | Yes | SQLite local path (`file:./dev.db`) or Postgres URL |
| `SESSION_SECRET` | Yes | 32+ character key for signing JWT tokens |
| `MASTER_PASSWORD` | Yes | Shared master passphrase for initial two users |

---

## 12. Known Limitations & Future Extension Points

- **Notifications**: Relies on browser-native Web Notifications API. Does not require paid third-party SMS/Email services.
- **Extensibility**: Data model supports adding individual user accounts and multi-tenant groups without altering task schema.
