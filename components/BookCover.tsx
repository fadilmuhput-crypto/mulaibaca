"use client";

import { useState } from "react";

type Props = {
  src: string | null;
  title: string;
  className?: string;
};

export default function BookCover({ src, title, className = "w-12 h-16" }: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`${className} rounded-lg bg-gradient-to-br from-cream to-amber-soft flex items-center justify-center flex-shrink-0`}>
        <span className="text-2xl">📗</span>
      </div>
    );
  }

  return (
    <div className={`${className} rounded-lg overflow-hidden bg-cream flex-shrink-0`}>
      <img
        src={src}
        alt={title}
        className="w-full h-full object-cover"
        onError={() => setFailed(true)}
        loading="lazy"
      />
    </div>
  );
}
