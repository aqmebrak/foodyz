"use client";

import Link from "next/link";

import { confirmLeave } from "@/lib/unsaved-guard";

interface GuardedBackLinkProps {
  href: string;
  "aria-label": string;
  className?: string;
  children: React.ReactNode;
}

/** Back link that asks for confirmation while the recipe form has unsaved changes. */
export function GuardedBackLink({ children, ...props }: GuardedBackLinkProps) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        if (!confirmLeave()) e.preventDefault();
      }}
    >
      {children}
    </Link>
  );
}
