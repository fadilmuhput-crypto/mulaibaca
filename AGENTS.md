<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Product Vision Reference

Before building any feature, consult `VISION.md` — especially the **Product Decision Checklist** (5 yes/no questions) and **Product Principles** (Simplicity First, Habit Over Achievement, Community Makes Reading Better, Build With Users, Progress Not Perfection, Grow the Reading Ecosystem). Every feature must align with the North Star Metric: **jumlah orang yang berhasil mempertahankan kebiasaan membaca**.

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
| `/api/cron/enrich` | `0 6 * * *` | Main dispatcher — triggers enrich/run + reminder + review-reminder |

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
