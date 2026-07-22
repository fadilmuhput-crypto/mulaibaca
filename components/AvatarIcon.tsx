import {
  BookOpen, Sprout, Feather, Star, Target, Lightbulb,
  Heart, Globe, Palette, Waves, Crown, Leaf,
} from "lucide-react";

// Avatar options shown in setup/profile picker
export const AVATAR_OPTIONS = [
  { key: "book",      label: "Pembaca",    Icon: BookOpen  },
  { key: "sprout",    label: "Penjelajah", Icon: Sprout    },
  { key: "feather",   label: "Penulis",    Icon: Feather   },
  { key: "star",      label: "Pemimpi",    Icon: Star      },
  { key: "target",    label: "Pencapai",   Icon: Target    },
  { key: "lightbulb", label: "Pemikir",    Icon: Lightbulb },
  { key: "heart",     label: "Romantis",   Icon: Heart     },
  { key: "globe",     label: "Petualang",  Icon: Globe     },
  { key: "palette",   label: "Kreatif",    Icon: Palette   },
  { key: "waves",     label: "Tenang",     Icon: Waves     },
  { key: "crown",     label: "Pemimpin",   Icon: Crown     },
  { key: "leaf",      label: "Bijaksana",  Icon: Leaf      },
] as const;

// Map legacy emoji values to icon keys
const EMOJI_MAP: Record<string, string> = {
  "📖": "book", "📗": "book", "📚": "book",
  "🌱": "sprout", "🐻": "sprout",
  "🦋": "feather", "🦉": "feather",
  "🌟": "star", "⭐": "star",
  "🎯": "target",
  "💡": "lightbulb",
  "❤️": "heart", "🌈": "heart",
  "🌊": "waves",
  "🎨": "palette",
  "🦁": "crown", "👑": "crown",
  "🍃": "leaf", "🌿": "leaf",
};

function isImageUrl(avatar: string): boolean {
  return avatar.startsWith("http://") || avatar.startsWith("https://");
}

function resolveKey(avatar: string): string {
  if (isImageUrl(avatar)) return "image";
  if (EMOJI_MAP[avatar]) return EMOJI_MAP[avatar];
  const opt = AVATAR_OPTIONS.find((o) => o.key === avatar);
  return opt ? avatar : "book";
}

export default function AvatarIcon({
  avatar,
  size = 20,
  className = "",
}: {
  avatar: string;
  size?: number;
  className?: string;
}) {
  // If it's an image URL, render the image
  if (isImageUrl(avatar)) {
    return (
      <img
        src={avatar}
        alt=""
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  const key = resolveKey(avatar);
  const opt = AVATAR_OPTIONS.find((o) => o.key === key) ?? AVATAR_OPTIONS[0];
  const Icon = opt.Icon;
  return <Icon size={size} className={className} strokeWidth={1.75} />;
}
