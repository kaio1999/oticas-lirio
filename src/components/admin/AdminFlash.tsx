"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Variant = "success" | "error" | "warning";

type Props = {
  message: string | null | undefined;
  variant?: Variant;
  /** Tempo até sumir (ms). */
  durationMs?: number;
  className?: string;
};

/**
 * Flash de sucesso/erro do admin.
 * Mantém a mensagem no estado local, limpa ?ok / ?erro da URL e some sozinho.
 */
export function AdminFlash({
  message,
  variant = "success",
  durationMs = 4000,
  className = "mt-4",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [flash, setFlash] = useState<{ text: string; variant: Variant } | null>(
    () => (message ? { text: message, variant } : null),
  );
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    if (!message) return;
    setFlash({ text: message, variant });
    setVisible(true);

    const url = new URL(window.location.href);
    let changed = false;
    for (const key of ["ok", "erro"]) {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        changed = true;
      }
    }
    if (changed) {
      const next = pathname + (url.search ? url.search : "");
      router.replace(next, { scroll: false });
    }
  }, [message, variant, pathname, router]);

  useEffect(() => {
    if (!visible || !flash) return;
    const t = window.setTimeout(() => setVisible(false), durationMs);
    return () => window.clearTimeout(t);
  }, [visible, flash, durationMs]);

  if (!visible || !flash) return null;

  const styles =
    flash.variant === "success"
      ? "bg-emerald-50 text-emerald-800"
      : flash.variant === "warning"
        ? "bg-amber-50 text-amber-800"
        : "bg-red-50 text-red-700";

  return (
    <p
      role="status"
      className={`rounded-xl px-3 py-2 text-sm ${styles} ${className}`}
    >
      {flash.text}
    </p>
  );
}
