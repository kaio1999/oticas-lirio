"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  prefetch?: boolean;
};

function PendingIndicator() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span
      className="ml-1.5 inline-block size-3 shrink-0 animate-spin rounded-full border-2 border-brand border-r-transparent align-middle"
      aria-hidden
    />
  );
}

/** Link do admin com spinner enquanto a rota carrega. */
export function AdminNavLink({
  href,
  children,
  className = "",
  target,
  prefetch = true,
}: Props) {
  return (
    <Link href={href} target={target} prefetch={prefetch} className={className}>
      {children}
      <PendingIndicator />
    </Link>
  );
}
