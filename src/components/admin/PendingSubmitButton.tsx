"use client";

import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  type?: "submit" | "button";
};

function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent ${className}`}
      aria-hidden
    />
  );
}

/** Botão de submit com spinner via useFormStatus (filho de <form>). */
export function PendingSubmitButton({
  children,
  pendingLabel,
  className = "",
  type = "submit",
}: Props) {
  const { pending } = useFormStatus();

  return (
    <button type={type} disabled={pending} className={className} aria-busy={pending}>
      {pending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Spinner />
          {pendingLabel ?? children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
