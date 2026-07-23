<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Product Vision Reference

Before building any feature, consult `VISION.md` — especially the **Product Decision Checklist** (5 yes/no questions) and **Product Principles** (Simplicity First, Habit Over Achievement, Community Makes Reading Better, Build With Users, Progress Not Perfection, Grow the Reading Ecosystem). Every feature must align with the North Star Metric: **jumlah orang yang berhasil mempertahankan kebiasaan membaca**.

# UI/UX Research & Design Skill

Reference: `/Users/fadil/Documents/opencode/mulaibaca/uiux-research-design.skill`

**When to trigger:** Any time a new feature, page, or flow is being designed or evaluated. This applies before AND after building.

**4 stages — match to what's needed:**

| Stage | What it answers | When to use |
|---|---|---|
| **Research** | Who are we designing for, what do they need? | New feature with unclear user need |
| **Define** | What's the specific problem to solve? | Research exists but problem is fuzzy |
| **Design** | What should it look like and flow like? | Problem is clear, time to shape screens |
| **Evaluate** | Does this design actually work? | Before/after shipping, audit existing flows |

**For every new feature, apply this checklist:**
1. Does it align with VISION.md principles? (Product Decision Checklist)
2. Who is the user and what's their current workaround? (Research/Define)
3. What are ALL the states — default, loading, empty, error? (Design)
4. Does it pass Nielsen's 10 heuristics? (Evaluate)
5. Does it meet WCAG 2.2 AA? — tap targets 44px+, contrast 4.5:1, keyboard accessible, focus visible (Evaluate)
6. Does it follow platform conventions users already know? (Design — see industry-standards.md)

**Key reference files (read as needed):**
- `references/evaluation-toolkit.md` — heuristic evaluation template, accessibility check criteria, usability test plan format
- `references/design-toolkit.md` — IA, user flows, wireframe annotation, handoff spec format
- `references/research-toolkit.md` — interview guide, persona template, JTBD format, competitive teardown
- `references/industry-standards.md` — Material 3, HIG, Fluent 2 conventions; tap targets, nav patterns, design tokens

**Output format:** Match to context — inline for quick decisions, saved file for team sharing, wireframe rendering when visual helps.

**Never skip:** Empty states, error states, edge cases. These are where products get designed poorly.

# VAPID Keys (Push Notifications)

## Setup
Generate VAPID keys and add to `.env.local`:
```bash
npx web-push generate-vapid-keys --json
```

## Required environment variables
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — public key for client-side subscription
- `VAPID_PRIVATE_KEY` — private key for server-side push sending

## SQL changes (run in Supabase dashboard)
See `supabase/pengingat-baca.sql` — adds `reminder_enabled` and `reminder_time` columns to `members`, creates `push_subscriptions` table.

# Cron Jobs

## Scheduled (vercel.json)
| Route | Schedule (UTC) | Purpose |
|---|---|---|
| `/api/cron/enrich` | `0 6 * * *` | Main dispatcher — triggers enrich/run + reminder + review-reminder + import-books |

## Individual cron routes
- `/api/cron/enrich/run` — enriches book metadata from OpenLibrary (pending/failed books)
- `/api/cron/reminder` — push reminder to read; streak saver: personalizes message if user has streak > 0 but hasn't logged today ("Streak X hari belum aman!")
- `/api/cron/review-reminder` — notif 3 days after finishing a book if no review written

## Notes
- All crons use `export const maxDuration = 300` (Vercel Pro feature; Hobby max 10s)
- `CRON_SECRET` env var gates internal fetch calls between cron routes
- Reminder time is per-user in `members.reminder_time` (format "HH:00", WIB)

# Session Log — July 2026

## Challenge recurring re-join
- `getChallengesData()` now checks if `completed_at` is within current period bounds; if from previous period → classify as "available" (not "completed")
- Join API (`/api/challenges/join`) resets participant record (clear completed_at, reset progress) when re-joining for new period
- `checkAndCompleteChallenges` skips participants whose `started_at` is from a previous period

## Dashboard simplification
- Removed MonthlyInsight from dashboard
- ChallengeEntryCard reverted to simple one-line entry point (summary API, no progress bars/badges)

## Automation
- Reminder cron enhanced: checks streaks + today's logs, sends personalized push for at-risk streaks
- New `/api/cron/review-reminder`: 3 days after book finished, notif if no review
- New `/api/cron/import-books`: bulk import books from OpenLibrary by predefined queries (12 queries, ~15-20 results each)
- New `scripts/import-books.ts`: CLI runner for same logic (`npx tsx --env-file=.env.local scripts/import-books.ts`)
- New `lib/import-books.ts`: shared logic — search OL, dedup by OL ID, insert new books

## Book discovery improvements
- New `/api/books/search-ol`: proxy to OpenLibrary Search API; returns 12 results with `already_exists` flag
- Search page (`/cari`): when local results = 0, shows "Cari di OpenLibrary" button → displays OL results → "Mau Baca" button imports via `/api/shelf`
- New `lib/recommendations.ts`: `getCollaborativeRecs()` — finds users with overlapping shelf books, recommends their other books (zero dependency on tags)
- Jelajah page (`/jelajah`): new section "Pembaca Lain Juga Baca…" using collaborative filtering (alongside existing "Karena Kamu Baca…" tag-based recs)

## Dedup buku
- New `lib/dedup.ts`: `findDuplicateGroups()`, `resolveDuplicates()`, `mergeBook()` — merges shelf_items/reviews/reading_logs
- New `/api/admin/dedup`: GET scan / POST resolve duplicates (admin-only via `is_cms_admin`)
- New `/admin/dedup`: admin UI with scan + resolve buttons
- Fixed auth check in dedup route: was checking `member_type` instead of `is_cms_admin`
- Migration: `supabase/migration-clubs.sql`

## Club Baca (community feature)
- Migration: `supabase/migration-clubs.sql` — tables `clubs` + `club_members` with RLS policies
- Club CRUD API: `GET/POST /api/clubs`, `GET /api/clubs/[id]`, `PUT/DELETE /api/clubs/[id]`
- Club membership: `POST /api/clubs/join` (by invite code), `POST /api/clubs/[id]/leave`, `POST /api/clubs/[id]/transfer` (admin transfer)
- All club API routes use `createAdminClient()` (bypass RLS); auth checked via `createRouteClient()` → `getUser()` → `getMemberId()`
- `/komunitas` tab "Klub": list user's clubs, create form, join by code
- `/komunitas/klub/[id]`: detail page with member list, copy invite code, edit/delete/transfer admin
- New `components/ConfirmDialog.tsx`: reusable modal with escape-key dismiss, supports `destructive` (boolean) or `variant` ("danger"/"default"). Used by klub detail + feed delete
- Club cover photo: `/api/upload/club-cover` (auto-creates `club-covers` bucket), admin upload via camera icon on detail page, cover shown in club cards
- Club member stats dashboard: `/api/clubs/[id]/stats` — per-member streak, pages/week, minutes/week, books finished/month, sorted by pages desc
- Club discovery: `/api/clubs/explore` — lists all active clubs with search, member count, and joined IDs; "Jelajahi" sub-tab in klub page with search input + direct join button
- Club visibility: `visibility` (public/private) + `join_type` (auto/approval) on create & edit
- Club join approval: `join_requests` table, `/api/clubs/[id]/requests` (GET), `/api/clubs/[id]/approve` (POST), `/api/clubs/[id]/reject` (POST)
- Club activity feed: `/api/clubs/[id]/activities` — logs from reading_logs, shelf_items, club_members
- Push notification for join requests: admin notified when someone requests to join (approval clubs)
- `lib/push.ts`: reusable `sendPushToMembers(memberIds, title, body)` — shared utility for all push notifications

## Club Challenge (halaman-based)
- Migration: `supabase/migration-club-challenges.sql` — table `club_challenges` with partial unique index (one active per club)
- `lib/club-challenges.ts`: types + `getClubChallenges()`, `getClubChallengeProgress()`
- API: `GET/POST /api/clubs/[id]/challenges` (list + create), `PATCH` (complete/cancel), `GET /api/clubs/[id]/challenges/progress`
- Admin-only creation; all members automatically participate (no join needed)
- Progress computed live from `reading_logs` between start_date and end_date
- UI: "Tantangan" tab in klub detail page — admin create form, progress bar, complete/cancel buttons
- Push notification on challenge creation + completion

## P0/P1 UX Improvements
- Loading skeletons: `components/Skeleton.tsx` + 6 `loading.tsx` files (dashboard, rak, log, review, progress, cari)
- Global toast: `components/Toast.tsx` with `useToast()` hook, wired into layout
- PWA: 192x192 icon (`logo-192.png`), `<meta name="theme-color">` in layout, manifest screenshots
- Error boundaries: `error.tsx` for `/rak`, `/log`, `/review`, `/progress`, `/cari`
- Search: 300ms debounce on URL update, "show more" pagination (30 items), OL loading state

## P2 Feature Completeness
- Edit review: `/review/tulis?edit=true&shelf=...&rating=...&qAbout=...` pre-fills form, PUT updates existing review
- Profile picture upload: `/api/upload/avatar` (auto-creates `avatars` bucket), camera icon on edit profile
- AvatarIcon: supports both icon keys and image URLs (renders `<img>` for URLs)

## P3 Polish
- Profile bio: `bio` column in members (200 char max), edit in profile, display on `/u/[username]`
- Profile shelves: "Lihat semua" links on done (12+) and want (9+) shelves
- Silent catches: fixed critical ones in KlubDetailClient with toast notifications
- Migration: `supabase/migration-bio.sql`

## UX Audit + P0 Fixes (July 2026)
- Full heuristic evaluation across 76 routes, 38 components using uiux-research-design skill
- Applied Nielsen's 10 heuristics + WCAG 2.2 AA checks

### P0 Fixes Applied
- **A1+A2:** ConfirmDialog + FeedbackModal — added `role="dialog"`, `aria-modal="true"`, focus trap, `aria-labelledby`
- **A3:** Toast dismiss button — 44px touch target + `aria-label`
- **A4:** Toast container — `role="status"` + `aria-live="polite"`
- **A5:** LogClient image delete — visible on touch (`sm:opacity-0 sm:group-hover:opacity-100`)
- **B1:** `globals.css` — added missing `.btn-secondary-sm` class (44px min-height)
- **B2:** New `/api/setup-profile` endpoint — Google OAuth profile completion (was sending wrong payload to `/api/daftar`)
- **B3:** `daftar`/`masuk` — fixed progress bar step timing (removed premature `setStep(0)`)
- **B4:** BookTimer — persist to `localStorage` (survives tab switch, phone calls, refresh)
- **B5:** QuickLogButtons — error toast on API failure via `useToast`
- **B6:** ShelfClient — `markReading`/`markDone` error handling + toasts
- **B7:** Dashboard — added "Komunitas" card section with club count/CTA

### UX Skill Integration
- UI/UX Research & Design skill loaded from `/Users/fadil/Documents/opencode/mulaibaca/uiux-research-design.skill`
- Reference files: evaluation-toolkit, design-toolkit, research-toolkit, industry-standards
- Applied to all future feature development per AGENTS.md guidelines
