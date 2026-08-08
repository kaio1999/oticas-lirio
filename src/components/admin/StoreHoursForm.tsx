"use client";

import { useState } from "react";
import { updateStoreHoursAction } from "@/app/admin/actions/store";
import { AdminFlash } from "@/components/admin/AdminFlash";
import { PendingSubmitButton } from "@/components/admin/PendingSubmitButton";
import type { StoreHours } from "@/types/store";

type Row = {
  days: string;
  time: string;
  closed: boolean;
};

type Props = {
  initialHours: StoreHours[];
  error?: string | null;
  success?: boolean;
};

function toRows(hours: StoreHours[]): Row[] {
  if (hours.length === 0) {
    return [
      { days: "Segunda a sexta", time: "09h – 18h", closed: false },
      { days: "Sábado", time: "09h – 13h", closed: false },
      { days: "Domingo", time: "Fechado", closed: true },
    ];
  }
  return hours.map((h) => {
    const closed = /^fechado$/i.test(h.time.trim());
    return {
      days: h.days,
      time: closed ? "" : h.time,
      closed,
    };
  });
}

export function StoreHoursForm({ initialHours, error, success }: Props) {
  const [rows, setRows] = useState<Row[]>(() => toRows(initialHours));

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  function addRow() {
    setRows((prev) => [...prev, { days: "", time: "", closed: false }]);
  }

  function removeRow(index: number) {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  const payload = rows.map((r) => ({
    days: r.days,
    time: r.closed ? "Fechado" : r.time,
    closed: r.closed,
  }));

  return (
    <form action={updateStoreHoursAction} className="space-y-5">
      <input type="hidden" name="hoursJson" value={JSON.stringify(payload)} />

      <AdminFlash
        message={
          error
            ? error
            : success
              ? "Horários salvos. Já aparecem na página Contato."
              : null
        }
        variant={error ? "error" : "success"}
      />

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-[1.2fr_1fr_auto] sm:items-end"
          >
            <label className="block text-sm font-medium">
              Dias
              <input
                value={row.days}
                onChange={(e) => updateRow(index, { days: e.target.value })}
                placeholder="Ex.: Segunda a sexta"
                required
                className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5"
              />
            </label>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={row.closed}
                  onChange={(e) =>
                    updateRow(index, {
                      closed: e.target.checked,
                      time: e.target.checked ? "" : row.time,
                    })
                  }
                  className="size-4 rounded border-line"
                />
                Fechado
              </label>
              {!row.closed ? (
                <label className="block text-sm font-medium">
                  Horário
                  <input
                    value={row.time}
                    onChange={(e) => updateRow(index, { time: e.target.value })}
                    placeholder="Ex.: 09h – 18h"
                    required
                    className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5"
                  />
                </label>
              ) : (
                <p className="rounded-xl bg-sand/60 px-3 py-2.5 text-sm text-ink-muted">
                  Fechado
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeRow(index)}
              disabled={rows.length <= 1}
              className="rounded-xl border border-line px-3 py-2.5 text-sm text-ink-muted transition hover:border-brand/40 hover:text-brand-ink disabled:opacity-40"
            >
              Remover
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={addRow}
          className="btn btn-secondary"
        >
          Adicionar linha
        </button>
        <PendingSubmitButton
          pendingLabel="Salvando…"
          className="btn btn-primary disabled:opacity-70"
        >
          Salvar horários
        </PendingSubmitButton>
      </div>

      <p className="text-xs text-ink-muted">
        Exemplos de horário: <span className="font-medium">09h – 18h</span> ou{" "}
        <span className="font-medium">09:00 às 13:00</span>. O que salvar aqui
        aparece em Contato no site.
      </p>
    </form>
  );
}
