"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { trackClick } from "@/lib/analytics";

type Props = ComponentProps<typeof Link> & {
  eventLabel: string;
  eventCategory?: string;
};

export default function TrackedLink({ eventLabel, eventCategory, onClick, ...props }: Props) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    trackClick(eventLabel, eventCategory);
    onClick?.(e);
  }

  return <Link {...props} onClick={handleClick} />;
}
