"use client";

import { type ElementType, useMemo } from "react";
import { Flame, BookOpen, Library, Star, Award } from "lucide-react";

const ICON_MAP: Record<string, ElementType> = {
  "🔥": Flame,
  "📖": BookOpen,
  "📚": Library,
  "🏅": Award,
  streak: Flame,
  pages: BookOpen,
  books: Library,
};

type BadgePingProps = {
  icon?: string;
  color?: string;
  size?: number;
  activityType?: string;
};

export default function BadgePing({ icon, color = "#C26E2A", size = 40, activityType }: BadgePingProps) {
  const Icon = useMemo(() => ICON_MAP[activityType ?? icon ?? ""] ?? Star, [activityType, icon]);
  const iconSize = Math.round(size * 0.44);
  const ringSize = Math.round(size * 0.1);
  const shineSize = Math.round(size * 0.55);

  return (
    <div
      className="relative flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: color }}
      />
      <div
        className="absolute rounded-full border border-white/20"
        style={{ inset: ringSize }}
      />
      <div
        className="absolute rounded-full bg-white/10"
        style={{
          top: Math.round(size * 0.15),
          left: Math.round(size * 0.18),
          width: shineSize,
          height: Math.round(shineSize * 0.45),
        }}
      />
      <Icon
        size={iconSize}
        strokeWidth={1.5}
        color="white"
        className="relative z-10"
      />
    </div>
  );
}
