export type Challenge = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  activity_type: string;
  goal_type: string;
  goal_value: number;
  duration_type: string;
  tier: number;
  badge_icon: string;
  badge_name: string;
  badge_color: string;
  is_active: boolean;
  sort_order: number;
};

export type Participant = {
  id: string;
  challenge_id: string;
  member_id: string;
  progress: number;
  started_at: string;
  completed_at: string | null;
};

export type Badge = {
  id: string;
  challenge_id: string;
  badge_name: string;
  badge_icon: string;
  badge_color: string;
  period_label: string | null;
  earned_at: string;
};

export type ChallengeWithStatus = Challenge & {
  status: "available" | "active" | "completed";
  progress: number;
  period_label: string | null;
  deadline: string | null;
};

export function getPeriodBounds(durationType: string): { start: Date; end: Date } {
  const now = new Date();
  if (durationType === "monthly") {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    };
  }
  if (durationType === "weekly") {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(now.getFullYear(), now.getMonth(), diff);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  }
  return { start: new Date(0), end: new Date(9999, 11, 31) };
}

export function getPeriodLabel(durationType: string): string | null {
  if (durationType === "unlimited") return null;
  const now = new Date();
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  if (durationType === "monthly") {
    return `${months[now.getMonth()]} ${now.getFullYear()}`;
  }
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(now.getFullYear(), now.getMonth(), diff);
  return `${start.getDate()} ${months[start.getMonth()]}`;
}

export function formatDeadline(dateStr: string): string {
  const d = new Date(dateStr);
  const diffMs = d.getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Hari terakhir!";
  if (diffDays === 1) return "Tersisa 1 hari";
  return `Tersisa ${diffDays} hari`;
}

export async function getChallengesData(
  supabase: any,
  memberId: string
): Promise<{
  available: ChallengeWithStatus[];
  active: ChallengeWithStatus[];
  completed: ChallengeWithStatus[];
  badges: Badge[];
}> {
  const bounds = {
    weekly: getPeriodBounds("weekly"),
    monthly: getPeriodBounds("monthly"),
  };

  const [challengesResult, participantsResult, badgesResult, weeklyLogsResult, monthlyLogsResult, streakResult, doneBooksResult] = await Promise.all([
    supabase.from("challenges").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("challenge_participants").select("*").eq("member_id", memberId),
    supabase.from("challenge_badges").select("*").eq("member_id", memberId).order("earned_at", { ascending: false }),
    supabase.from("reading_logs").select("pages_read").eq("member_id", memberId).gte("log_date", bounds.weekly.start.toISOString().split("T")[0]).lte("log_date", bounds.weekly.end.toISOString().split("T")[0]),
    supabase.from("reading_logs").select("pages_read").eq("member_id", memberId).gte("log_date", bounds.monthly.start.toISOString().split("T")[0]).lte("log_date", bounds.monthly.end.toISOString().split("T")[0]),
    supabase.from("streaks").select("current_streak").eq("member_id", memberId).maybeSingle(),
    supabase.from("shelf_items").select("id").eq("member_id", memberId).eq("status", "done").gte("finished_at", bounds.monthly.start.toISOString()).lte("finished_at", bounds.monthly.end.toISOString()),
  ]);

  const challenges = (challengesResult.data ?? []) as Challenge[];
  const participants = (participantsResult.data ?? []) as Participant[];
  const badges = (badgesResult.data ?? []) as Badge[];

  const weeklyPages = ((weeklyLogsResult.data ?? []) as { pages_read: number }[]).reduce((s, l) => s + (l.pages_read ?? 0), 0);
  const monthlyPages = ((monthlyLogsResult.data ?? []) as { pages_read: number }[]).reduce((s, l) => s + (l.pages_read ?? 0), 0);
  const currentStreak = streakResult.data?.current_streak ?? 0;
  const monthlyBooksDone = (doneBooksResult.data ?? []).length;

  const getProgress = (c: Challenge) => {
    if (c.activity_type === "pages" && c.duration_type === "weekly") return weeklyPages;
    if (c.activity_type === "pages" && c.duration_type === "monthly") return monthlyPages;
    if (c.activity_type === "streak") return currentStreak;
    if (c.activity_type === "books") return monthlyBooksDone;
    return 0;
  };

  const completedIds = new Set(badges.map((b) => b.challenge_id));

  const available: ChallengeWithStatus[] = [];
  const active: ChallengeWithStatus[] = [];
  const completed: ChallengeWithStatus[] = [];

  for (const c of challenges) {
    const periodLabel = getPeriodLabel(c.duration_type);
    const bounds = getPeriodBounds(c.duration_type);
    const deadline = c.duration_type !== "unlimited" ? bounds.end.toISOString() : null;
    const progress = getProgress(c);

    const participant = participants.find((p) => p.challenge_id === c.id);
    const hasBadge = completedIds.has(c.id);
    const isUnlimitedCompleted = c.duration_type === "unlimited" && hasBadge;

    let isRecurringCompleted = false;
    if (c.duration_type !== "unlimited" && participant?.completed_at != null) {
      const bounds = getPeriodBounds(c.duration_type);
      isRecurringCompleted = new Date(participant.completed_at) >= bounds.start;
    }

    if (isUnlimitedCompleted || isRecurringCompleted) {
      completed.push({ ...c, status: "completed", progress: c.goal_value, period_label: periodLabel, deadline });
    } else if (participant && !participant.completed_at && c.duration_type === "unlimited") {
      active.push({ ...c, status: "active", progress, period_label: periodLabel, deadline });
    } else if (participant && !participant.completed_at) {
      const bounds = getPeriodBounds(c.duration_type);
      if (new Date(participant.started_at) >= bounds.start) {
        active.push({ ...c, status: "active", progress, period_label: periodLabel, deadline });
      } else {
        available.push({ ...c, status: "available", progress, period_label: periodLabel, deadline });
      }
    } else {
      available.push({ ...c, status: "available", progress, period_label: periodLabel, deadline });
    }
  }

  return { available, active, completed, badges };
}

export function isCompleted(progress: number, goal: number): boolean {
  return progress >= goal;
}

export type SupabaseClient = any;

export async function calculateProgress(
  supabase: SupabaseClient,
  memberId: string,
  challenge: Challenge,
  bounds: { start: Date; end: Date }
): Promise<number> {
  if (challenge.activity_type === "pages") {
    const { data } = await supabase
      .from("reading_logs")
      .select("pages_read")
      .eq("member_id", memberId)
      .gte("log_date", bounds.start.toISOString().split("T")[0])
      .lte("log_date", bounds.end.toISOString().split("T")[0]);
    return (data ?? []).reduce((sum: number, l: { pages_read: number }) => sum + (l.pages_read ?? 0), 0);
  }
  if (challenge.activity_type === "streak") {
    const { data } = await supabase
      .from("streaks")
      .select("current_streak")
      .eq("member_id", memberId)
      .maybeSingle();
    return data?.current_streak ?? 0;
  }
  if (challenge.activity_type === "books") {
    const { data } = await supabase
      .from("shelf_items")
      .select("id")
      .eq("member_id", memberId)
      .eq("status", "done")
      .gte("finished_at", bounds.start.toISOString())
      .lte("finished_at", bounds.end.toISOString());
    return data?.length ?? 0;
  }
  return 0;
}

export async function checkAndCompleteChallenges(
  supabase: any,
  memberId: string,
  familyId: string,
  admin?: any
): Promise<{ completed: { title: string; badge_name: string; badge_icon: string }[] }> {
  const adminClient = admin ?? supabase;
  const completedChallenges: { title: string; badge_name: string; badge_icon: string }[] = [];

  const { data: participants } = await adminClient
    .from("challenge_participants")
    .select("*, challenges(*)")
    .eq("member_id", memberId)
    .is("completed_at", null);

  if (!participants || participants.length === 0) return { completed: [] };

  const { data: existingBadges } = await adminClient
    .from("challenge_badges")
    .select("challenge_id")
    .eq("member_id", memberId);

  const earnedIds = new Set((existingBadges ?? []).map((b: any) => b.challenge_id));

  for (const p of participants) {
    const challenge = p.challenges as Challenge;
    if (!challenge) continue;
    if (challenge.duration_type === "unlimited" && earnedIds.has(challenge.id)) continue;
    if (challenge.duration_type !== "unlimited" && p.completed_at) continue;

    // Skip if recurring participant is from a previous period (must opt-in again)
    if (challenge.duration_type !== "unlimited") {
      const periodStart = getPeriodBounds(challenge.duration_type).start;
      if (new Date(p.started_at) < periodStart) continue;
    }

    const bounds = getPeriodBounds(challenge.duration_type);
    const progress = await calculateProgress(supabase, memberId, challenge, bounds);

    // Almost-done nudge (80%+)
    const pct = progress / challenge.goal_value;
    if (pct >= 0.8 && pct < 1 && challenge.duration_type !== "unlimited") {
      try {
        const { data: existingNudge } = await adminClient
          .from("notifications")
          .select("id")
          .eq("member_id", memberId)
          .eq("title", `📣 ${challenge.title}`)
          .maybeSingle();
        if (!existingNudge) {
          const { createNotification } = await import("@/lib/notifications");
          await createNotification({
            memberId,
            title: `📣 ${challenge.title}`,
            body: `Tinggal ${challenge.goal_value - progress} ${challenge.activity_type === "pages" ? "halaman" : challenge.activity_type === "streak" ? "hari" : "buku"} lagi! Semangat!`,
            type: "achievement",
            link: `/komunitas/tantangan/${challenge.id}`,
          }, adminClient);
        }
      } catch (e) {
        console.error("[challenges] failed to send nudge", e);
      }
    }

    if (progress >= challenge.goal_value) {
      const periodLabel = getPeriodLabel(challenge.duration_type);

      completedChallenges.push({ title: challenge.title, badge_name: challenge.badge_name, badge_icon: challenge.badge_icon });

      await adminClient
        .from("challenge_participants")
        .update({ progress, completed_at: new Date().toISOString() })
        .eq("id", p.id);

      if (!earnedIds.has(challenge.id)) {
        await adminClient
          .from("challenge_badges")
          .insert({
            challenge_id: challenge.id,
            member_id: memberId,
            badge_name: challenge.badge_name,
            badge_icon: challenge.badge_icon,
            badge_color: challenge.badge_color,
            period_label: periodLabel,
          });
      }

      // Auto-join next tier (e.g. streak 3 → streak 7 → streak 14)
      if (challenge.duration_type === "unlimited") {
        const { data: nextChallenges } = await adminClient
          .from("challenges")
          .select("*")
          .eq("activity_type", challenge.activity_type)
          .eq("duration_type", "unlimited")
          .eq("tier", challenge.tier + 1)
          .eq("is_active", true)
          .limit(1);

        const nextChallenge = nextChallenges?.[0] as Challenge | undefined;
        if (nextChallenge) {
          const { data: alreadyJoined } = await adminClient
            .from("challenge_participants")
            .select("id")
            .eq("challenge_id", nextChallenge.id)
            .eq("member_id", memberId)
            .maybeSingle();

          if (!alreadyJoined) {
            await adminClient
              .from("challenge_participants")
              .insert({ challenge_id: nextChallenge.id, member_id: memberId });

            try {
              const { createNotification } = await import("@/lib/notifications");
              await createNotification({
                memberId,
                title: `⬆️ Tantangan berikutnya: ${nextChallenge.title}`,
                body: `Kamu otomatis terdaftar di tantangan "${nextChallenge.title}". Pertahankan streak-mu!`,
                type: "achievement",
                link: `/komunitas/tantangan/${nextChallenge.id}`,
              }, adminClient);
            } catch (e) {
              console.error("[challenges] failed to notify next tier", e);
            }
          }
        }
      }

      try {
        const { insertActivity } = await import("@/lib/activity-feed");
        await insertActivity(memberId, familyId, "challenge_earn", {
          challenge_id: challenge.id,
          challenge_title: challenge.title,
          badge_name: challenge.badge_name,
          badge_icon: challenge.badge_icon,
          badge_color: challenge.badge_color,
          period_label: periodLabel,
        }, adminClient);
      } catch (e) {
        console.error("[challenges] failed to insert activity", e);
      }

      try {
        const { createNotification } = await import("@/lib/notifications");
        await createNotification({
          memberId,
          title: `🏅 ${challenge.badge_name}`,
          body: `Selamat! Kamu berhasil menyelesaikan tantangan "${challenge.title}"!`,
          type: "achievement",
          link: "/komunitas",
        }, adminClient);
      } catch (e) {
        console.error("[challenges] failed to create notification", e);
      }
    }
  }

  return { completed: completedChallenges };
}
