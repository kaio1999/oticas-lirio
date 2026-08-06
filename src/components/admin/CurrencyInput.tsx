"use client";

import { useState } from "react";
import { formatBRLMask } from "@/lib/format";

type Props = {
  name?: string;
  defaultValue?: number;
  required?: boolean;
  className?: string;
  id?: string;
};

/**
 * Input de moeda BRL: digita centavos (10050 → 100,50) e envia valor numérico.
 */
export function CurrencyInput({
  name = "price",
  defaultValue = 0,
  required,
  className = "",
  id,
}: Props) {
  const initialCents = Math.round(Math.max(0, defaultValue) * 100);
  const [cents, setCents] = useState(initialCents);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
    setCents(digits ? Number(digits) : 0);
  }

  const display = formatBRLMask(cents / 100);
  const numeric = (cents / 100).toFixed(2);

  return (
    <div className="relative">
      <span
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted"
        aria-hidden
      >
        R$
      </span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={display}
        onChange={onChange}
        placeholder="0,00"
        aria-label="Preço em reais"
        className={`w-full rounded-xl border border-line px-3 py-2.5 pl-10 ${className}`}
      />
      <input
        type="hidden"
        name={name}
        value={numeric}
        required={required}
      />
    </div>
  );
}
