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
