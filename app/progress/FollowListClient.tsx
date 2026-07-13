"use client";

import Link from "next/link";
import AvatarIcon from "@/components/AvatarIcon";
import FollowButton from "@/components/FollowButton";

type Member = {
  id: string;
  name: string;
  avatar: string | null;
  username: string | null;
};

export default function FollowListClient({
  members,
  viewerMemberId,
  emptyMessage,
}: {
  members: Member[];
  viewerMemberId: string;
  emptyMessage: string;
}) {
  if (members.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-border p-8 text-center">
        <p className="text-sm text-ink-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl border border-border divide-y divide-border/60">
      {members.map((m) => (
        <div key={m.id} className="flex items-center gap-3 px-4 py-3">
          {m.username ? (
            <Link href={`/u/${m.username}`} className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-amber-soft flex items-center justify-center text-amber flex-shrink-0">
                <AvatarIcon avatar={m.avatar ?? ""} size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-ink truncate">{m.name}</p>
                {m.username && <p className="text-[10px] text-ink-muted truncate">@{m.username}</p>}
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-amber-soft flex items-center justify-center text-amber flex-shrink-0">
                <AvatarIcon avatar={m.avatar ?? ""} size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-ink truncate">{m.name}</p>
              </div>
            </div>
          )}
          {m.id !== viewerMemberId && (
            <FollowButton
              targetId={m.id}
              initialFollowers={0}
              initialIsFollowing={false}
              viewerMemberId={viewerMemberId}
            />
          )}
        </div>
      ))}
    </div>
  );
}
