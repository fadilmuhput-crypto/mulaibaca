"use client";

import { useState } from "react";
import Image from "next/image";
import { BookText } from "lucide-react";

type Props = {
  src: string | null;
  title: string;
  className?: string;
};

export default function BookCover({ src, title, className = "w-12 h-16 rounded-lg" }: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`${className} bg-gradient-to-br from-cream to-amber-soft flex items-center justify-center flex-shrink-0`}>
        <BookText size={20} strokeWidth={1.5} className="text-amber/60" />
      </div>
    );
  }

  return (
    <div className={`${className} relative overflow-hidden bg-cream flex-shrink-0`}>
      <Image
        src={src}
        alt={title}
        fill
        sizes="96px"
        className="object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
