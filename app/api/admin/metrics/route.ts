import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-route";

export async function GET() {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];
  const _7dAgo = new Date(Date.now() - 7 * 864e5).toISOString().split("T")[0];
  const _30dAgo = new Date(Date.now() - 30 * 864e5).toISOString().split("T")[0];

  const [
    { count: totalFamilies },
    { count: totalMembers },
    { count: totalRegistered },
    { count: totalChildren },
    { count: totalBooks },
    { count: activeToday },
    { count: log7d },
    { count: log30d },
    { data: todayLogRaw },
    { data: logs30d },
    { data: avgData },
    { data: streaksAll },
    { data: membersAll },
    { data: enrichmentData },
    { data: shelfItems },
    { data: allReviews },
    { data: reviews30d },
    { data: notifData },
    { data: families },
    { data: registeredMembers },
    { data: booksWithUsage },
    { count: totalFeedItems },
    { count: totalFeedLikes },
    { count: totalFeedComments },
    { data: feed30d },
    { data: challengeParticipants },
    { count: totalBadges },
    { data: completedParticipants },
    { count: totalFollows },
  ] = await Promise.all([
    supabase.from("families").select("id", { count: "exact", head: true }),
    supabase.from("members").select("id", { count: "exact", head: true }),
    supabase.from("members").select("id", { count: "exact", head: true }).not("auth_user_id", "is", null),
    supabase.from("members").select("id", { count: "exact", head: true }).is("auth_user_id", null),
    supabase.from("books").select("id", { count: "exact", head: true }),
    supabase.from("reading_logs").select("member_id", { count: "exact", head: true }).eq("log_date", today),
    supabase.from("reading_logs").select("id", { count: "exact", head: true }).gte("log_date", _7dAgo),
    supabase.from("reading_logs").select("id", { count: "exact", head: true }).gte("log_date", _30dAgo),
    supabase.from("reading_logs").select("pages_read, duration_minutes, member_id").eq("log_date", today),
    supabase.from("reading_logs").select("log_date, pages_read, member_id").gte("log_date", _30dAgo),
    supabase.from("reading_logs").select("pages_read, duration_minutes"),
    supabase.from("streaks").select("current_streak, longest_streak, member_id"),
    supabase.from("members").select("id, auth_user_id, family_id, weekly_pages_goal"),
    supabase.from("books").select("enrichment_status, id"),
    supabase.from("shelf_items").select("status, member_id, book_id"),
    supabase.from("reviews").select("rating, member_id, published_at, shelf_item_id"),
    supabase.from("reviews").select("published_at").gte("published_at", _30dAgo),
    supabase.from("notifications").select("type, is_read"),
    supabase.from("families").select("created_at, id").gte("created_at", _30dAgo),
    supabase.from("members").select("created_at, member_type").not("auth_user_id", "is", null).gte("created_at", _30dAgo),
    supabase.from("shelf_items").select("book_id, books!inner(title, author)").limit(100000),
    supabase.from("activity_feed").select("id", { count: "exact", head: true }),
    supabase.from("feed_likes").select("id", { count: "exact", head: true }),
    supabase.from("feed_comments").select("id", { count: "exact", head: true }),
    supabase.from("activity_feed").select("activity_type, created_at, member_id").gte("created_at", _30dAgo),
    supabase.from("challenge_participants").select("member_id, completed_at"),
    supabase.from("challenge_badges").select("id", { count: "exact", head: true }),
    supabase.from("challenge_participants").select("id").not("completed_at", "is", null),
    supabase.from("follows").select("follower_id", { count: "exact", head: true }),
  ]);

  // ── Snapshot ──
  const todaySesi = todayLogRaw?.length ?? 0;
  const todayHalaman = (todayLogRaw ?? []).reduce((s: number, l: { pages_read: number }) => s + l.pages_read, 0);
  const todayPembaca = new Set((todayLogRaw ?? []).map((l: { member_id: string }) => l.member_id)).size;

  const sLogs = (avgData ?? []) as { pages_read: number; duration_minutes: number | null }[];
  const avgPages = sLogs.length ? Math.round((sLogs.reduce((s, l) => s + l.pages_read, 0) / sLogs.length) * 10) / 10 : 0;
  const avgDur = sLogs.length ? Math.round((sLogs.reduce((s, l) => s + (l.duration_minutes ?? 0), 0) / sLogs.length) * 10) / 10 : 0;

  // ── Activity daily ──
  const dailyMap: Record<string, { sesi: number; pembaca: Set<string>; halaman: number }> = {};
  for (const l of logs30d ?? []) {
    const log = l as { log_date: string; pages_read: number; member_id: string };
    if (!dailyMap[log.log_date]) dailyMap[log.log_date] = { sesi: 0, pembaca: new Set(), halaman: 0 };
    dailyMap[log.log_date].sesi++;
    dailyMap[log.log_date].pembaca.add(log.member_id);
    dailyMap[log.log_date].halaman += log.pages_read;
  }
  const dailyActivity = Object.entries(dailyMap).map(([date, v]) => ({
    date, sesi: v.sesi, pembaca: v.pembaca.size, halaman: v.halaman,
  }));

  // ── Streak distribution ──
  const sMap: Record<string, number> = { "0": 0, "1-2": 0, "3-6": 0, "7-13": 0, "14-20": 0, "21-29": 0, "30-59": 0, "60-99": 0, "100+": 0 };
  for (const s of streaksAll ?? []) {
    const cur = (s as { current_streak: number }).current_streak;
    if (cur === 0) sMap["0"]++;
    else if (cur <= 2) sMap["1-2"]++;
    else if (cur <= 6) sMap["3-6"]++;
    else if (cur <= 13) sMap["7-13"]++;
    else if (cur <= 20) sMap["14-20"]++;
    else if (cur <= 29) sMap["21-29"]++;
    else if (cur <= 59) sMap["30-59"]++;
    else if (cur <= 99) sMap["60-99"]++;
    else sMap["100+"]++;
  }
  const streakDist = Object.entries(sMap).map(([label, jumlah]) => ({ label, jumlah }));
  const regStreaks = (streaksAll ?? []).filter((s: { current_streak: number }) => s.current_streak > 0);
  const avgStreak = regStreaks.length ? Math.round((regStreaks.reduce((s: number, r: { current_streak: number }) => s + r.current_streak, 0) / regStreaks.length) * 10) / 10 : 0;
  const maxStreak = (streaksAll ?? []).reduce((m: number, s: { current_streak: number }) => Math.max(m, s.current_streak), 0);

  // ── Content ──
  const enrichment = (enrichmentData ?? []).reduce((acc: Record<string, number>, b: { enrichment_status: string }) => {
    acc[b.enrichment_status] = (acc[b.enrichment_status] ?? 0) + 1;
    return acc;
  }, {});
  const shelfStatus = (shelfItems ?? []).reduce((acc: Record<string, number>, s: { status: string }) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {});

  // ── Top books ──
  const bookCount: Record<string, { title: string; author: string | null; jumlah: number }> = {};
  for (const item of booksWithUsage ?? []) {
    const raw = item as { book_id: string; books: { title: string; author: string | null }[] };
    const book = raw.books?.[0];
    if (!book) continue;
    if (!bookCount[raw.book_id]) bookCount[raw.book_id] = { title: book.title, author: book.author, jumlah: 0 };
    bookCount[raw.book_id].jumlah++;
  }
  const topBooks = Object.values(bookCount).sort((a, b) => b.jumlah - a.jumlah).slice(0, 10);

  // ── Reviews ──
  const totalReviews = allReviews?.length ?? 0;
  const avgRating = totalReviews ? Math.round(((allReviews ?? []).reduce((s: number, r: { rating: number }) => s + r.rating, 0) / totalReviews) * 10) / 10 : 0;
  const ratingDist: Record<string, number> = {};
  for (const r of allReviews ?? []) { const k = String((r as { rating: number }).rating); ratingDist[k] = (ratingDist[k] ?? 0) + 1; }
  const reviewsPerDay: Record<string, number> = {};
  for (const r of reviews30d ?? []) { const d = (r as { published_at: string }).published_at.slice(0, 10); reviewsPerDay[d] = (reviewsPerDay[d] ?? 0) + 1; }

  // ── Feed activity (30d) ──
  const feedTypeCount: Record<string, number> = {};
  for (const f of feed30d ?? []) {
    const ft = (f as { activity_type: string }).activity_type;
    feedTypeCount[ft] = (feedTypeCount[ft] ?? 0) + 1;
  }

  // ── Challenges ──
  const totalChallengeParticipants = new Set((challengeParticipants ?? []).map((p: { member_id: string }) => p.member_id)).size;
  const totalCompleted = completedParticipants?.length ?? 0;
  const totalChalPart = (challengeParticipants ?? []).length;

  // ── Funnel ──
  const totalAnggota = (membersAll ?? []).length;
  const punyaAuth = (membersAll ?? []).filter((m: { auth_user_id: string | null }) => m.auth_user_id).length;
  const shelfMemberIds = new Set((shelfItems ?? []).map((s: { member_id: string }) => s.member_id));
  const logMemberIds = new Set((logs30d ?? []).map((l: { member_id: string }) => l.member_id));
  const punyaTarget = (membersAll ?? []).filter((m: { weekly_pages_goal: number }) => (m.weekly_pages_goal ?? 0) > 0).length;
  const punyaStreak = regStreaks.length;
  const challengeMemberIds = new Set((challengeParticipants ?? []).map((p: { member_id: string }) => p.member_id));
  const feedMemberIds = new Set((feed30d ?? []).map((f: { member_id: string }) => f.member_id));

  const familyMemberCounts: Record<string, number> = {};
  for (const m of membersAll ?? []) { const mem = m as { family_id: string; id: string }; familyMemberCounts[mem.family_id] = (familyMemberCounts[mem.family_id] ?? 0) + 1; }
  const punyaKeluarga = new Set((membersAll ?? []).filter((m: { family_id: string; id: string }) => familyMemberCounts[m.family_id] > 1).map((m: { id: string }) => m.id));

  const funnel = [
    { langkah: "Total anggota", jumlah: totalAnggota },
    { langkah: "Punya akun", jumlah: punyaAuth },
    { langkah: "Tambah buku", jumlah: shelfMemberIds.size },
    { langkah: "Catat bacaan", jumlah: logMemberIds.size },
    { langkah: "Atur target", jumlah: punyaTarget },
    { langkah: "Punya streak", jumlah: punyaStreak },
    { langkah: "Ikut tantangan", jumlah: challengeMemberIds.size },
    { langkah: "Bagikan aktivitas", jumlah: feedMemberIds.size },
    { langkah: "Ajak keluarga", jumlah: punyaKeluarga.size },
  ];

  // ── Family size ──
  const famSizeCount: Record<string, { size: number; count: number }> = {};
  for (const m of membersAll ?? []) { const mem = m as { family_id: string }; if (!famSizeCount[mem.family_id]) famSizeCount[mem.family_id] = { size: 0, count: 0 }; famSizeCount[mem.family_id].size++; }
  Object.values(famSizeCount).forEach((f) => f.count++);
  const familySizeDist: Record<string, number> = {};
  for (const f of Object.values(famSizeCount)) { const key = f.size === 1 ? "1" : f.size === 2 ? "2" : f.size <= 4 ? "3-4" : f.size <= 6 ? "5-6" : "7+"; familySizeDist[key] = (familySizeDist[key] ?? 0) + 1; }

  // ── Notifications ──
  const notifByType = (notifData ?? []).reduce((acc: Record<string, { total: number; read: number }>, n: { type: string; is_read: boolean }) => {
    if (!acc[n.type]) acc[n.type] = { total: 0, read: 0 };
    acc[n.type].total++; if (n.is_read) acc[n.type].read++;
    return acc;
  }, {});

  // ── Growth ──
  const familiesPerDay: Record<string, number> = {};
  for (const f of families ?? []) { const d = (f as { created_at: string }).created_at.slice(0, 10); familiesPerDay[d] = (familiesPerDay[d] ?? 0) + 1; }
  const membersPerDay: Record<string, number> = {};
  for (const m of registeredMembers ?? []) { const d = (m as { created_at: string }).created_at.slice(0, 10); membersPerDay[d] = (membersPerDay[d] ?? 0) + 1; }

  return NextResponse.json({
    snapshot: {
      totalFamilies: totalFamilies ?? 0,
      totalMembers: totalMembers ?? 0,
      totalRegistered: totalRegistered ?? 0,
      totalChildren: totalChildren ?? 0,
      totalBooks: totalBooks ?? 0,
      activeToday, active7d: log7d ?? 0, active30d: log30d ?? 0,
      todaySesi, todayHalaman, todayPembaca,
      avgPagesPerSession: avgPages, avgDurationPerSession: avgDur,
    },
    growth: { familiesPerDay, membersPerDay },
    activity: { daily: dailyActivity },
    content: { enrichment, shelfStatus },
    streaks: { distribution: streakDist, avg: avgStreak, max: maxStreak },
    reviews: { total: totalReviews, avgRating, ratingDistribution: ratingDist, perDay: reviewsPerDay },
    topBooks,
    funnel,
    familySize: familySizeDist,
    notifications: notifByType,
    feed: {
      totalItems: totalFeedItems ?? 0,
      totalLikes: totalFeedLikes ?? 0,
      totalComments: totalFeedComments ?? 0,
      perType: feedTypeCount,
    },
    challenges: {
      totalParticipants: totalChallengeParticipants,
      totalParticipations: totalChalPart,
      totalBadges: totalBadges ?? 0,
      totalCompleted,
    },
    follows: totalFollows ?? 0,
  });
}
