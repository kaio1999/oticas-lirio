"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { categoryLabels, formatPrice, shapeLabels } from "@/lib/format";

const categories = ["todos", "grau", "sol", "infantil", "acessorio"] as const;
const shapes = [
  "todos",
  "aviador",
  "redondo",
  "quadrado",
  "gatinho",
  "retangular",
] as const;

type Props = {
  materials: string[];
  brands: string[];
  priceBounds: { min: number; max: number };
};

function parsePriceParam(raw: string | null, fallback: number) {
  if (raw == null || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function CatalogFilters({ materials, brands, priceBounds }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const boundMin = priceBounds.min;
  const boundMax = priceBounds.max;

  const urlMin = parsePriceParam(searchParams.get("precoMin"), boundMin);
  const urlMax = parsePriceParam(searchParams.get("precoMax"), boundMax);

  const [rangeMin, setRangeMin] = useState(() =>
    Math.min(Math.max(urlMin, boundMin), boundMax),
  );
  const [rangeMax, setRangeMax] = useState(() =>
    Math.max(Math.min(urlMax, boundMax), boundMin),
  );

  useEffect(() => {
    setRangeMin(Math.min(Math.max(urlMin, boundMin), boundMax));
    setRangeMax(Math.max(Math.min(urlMax, boundMax), boundMin));
  }, [urlMin, urlMax, boundMin, boundMax]);

  function pushParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    startTransition(() => {
      router.push(`/produtos?${params.toString()}`);
    });
  }

  function update(key: string, value: string) {
    pushParams((params) => {
      if (!value || value === "todos") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
  }

  function commitPriceRange(nextMin: number, nextMax: number) {
    let lo = Math.min(nextMin, nextMax);
    let hi = Math.max(nextMin, nextMax);
    lo = Math.min(Math.max(lo, boundMin), boundMax);
    hi = Math.min(Math.max(hi, boundMin), boundMax);

    pushParams((params) => {
      if (lo <= boundMin) params.delete("precoMin");
      else params.set("precoMin", String(Math.round(lo)));
      if (hi >= boundMax) params.delete("precoMax");
      else params.set("precoMax", String(Math.round(hi)));
    });
  }

  const pctLeft = ((rangeMin - boundMin) / (boundMax - boundMin)) * 100;
  const pctRight = ((rangeMax - boundMin) / (boundMax - boundMin)) * 100;

  return (
    <form
      className={`grid gap-3 rounded-2xl border border-line bg-white/60 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 ${pending ? "opacity-70" : ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        update("q", String(form.get("q") ?? ""));
      }}
    >
      <label className="block sm:col-span-2 lg:col-span-1 xl:col-span-1">
        <span className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-ink-muted">
          Busca
        </span>
        <input
          name="q"
          defaultValue={searchParams.get("q") ?? ""}
          placeholder="Nome, cor, marca…"
          className="w-full rounded-xl border border-line bg-white px-3 py-2.5 outline-none ring-brand/30 focus:ring-2"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-ink-muted">
          Marca
        </span>
        <select
          className="w-full rounded-xl border border-line bg-white px-3 py-2.5 outline-none ring-brand/30 focus:ring-2"
          value={searchParams.get("marca") ?? "todos"}
          onChange={(e) => update("marca", e.target.value)}
        >
          <option value="todos">Todas</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-ink-muted">
          Categoria
        </span>
        <select
          className="w-full rounded-xl border border-line bg-white px-3 py-2.5 outline-none ring-brand/30 focus:ring-2"
          value={searchParams.get("categoria") ?? "todos"}
          onChange={(e) => update("categoria", e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "todos" ? "Todas" : categoryLabels[c]}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-ink-muted">
          Formato
        </span>
        <select
          className="w-full rounded-xl border border-line bg-white px-3 py-2.5 outline-none ring-brand/30 focus:ring-2"
          value={searchParams.get("formato") ?? "todos"}
          onChange={(e) => update("formato", e.target.value)}
        >
          {shapes.map((s) => (
            <option key={s} value={s}>
              {s === "todos" ? "Todos" : shapeLabels[s]}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-ink-muted">
          Material
        </span>
        <select
          className="w-full rounded-xl border border-line bg-white px-3 py-2.5 outline-none ring-brand/30 focus:ring-2"
          value={searchParams.get("material") ?? "todos"}
          onChange={(e) => update("material", e.target.value)}
        >
          <option value="todos">Todos</option>
          {materials.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>

      <div className="sm:col-span-2 lg:col-span-3 xl:col-span-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <span className="text-xs uppercase tracking-[0.12em] text-ink-muted">
            Faixa de preço
          </span>
          <p className="text-sm font-medium text-brand-ink">
            {formatPrice(rangeMin)} — {formatPrice(rangeMax)}
          </p>
        </div>

        <div className="relative mt-5 h-6">
          <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-line" />
          <div
            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand"
            style={{
              left: `${pctLeft}%`,
              width: `${Math.max(0, pctRight - pctLeft)}%`,
            }}
          />
          <input
            type="range"
            min={boundMin}
            max={boundMax}
            step={1}
            value={rangeMin}
            aria-label="Preço mínimo"
            className="price-range-thumb absolute inset-0 z-[2] w-full appearance-none bg-transparent"
            onChange={(e) => {
              const next = Math.min(Number(e.target.value), rangeMax);
              setRangeMin(next);
            }}
            onPointerUp={(e) => {
              const next = Math.min(
                Number((e.target as HTMLInputElement).value),
                rangeMax,
              );
              commitPriceRange(next, rangeMax);
            }}
            onKeyUp={(e) => {
              const next = Math.min(
                Number((e.target as HTMLInputElement).value),
                rangeMax,
              );
              commitPriceRange(next, rangeMax);
            }}
          />
          <input
            type="range"
            min={boundMin}
            max={boundMax}
            step={1}
            value={rangeMax}
            aria-label="Preço máximo"
            className="price-range-thumb absolute inset-0 z-[3] w-full appearance-none bg-transparent"
            onChange={(e) => {
              const next = Math.max(Number(e.target.value), rangeMin);
              setRangeMax(next);
            }}
            onPointerUp={(e) => {
              const next = Math.max(
                Number((e.target as HTMLInputElement).value),
                rangeMin,
              );
              commitPriceRange(rangeMin, next);
            }}
            onKeyUp={(e) => {
              const next = Math.max(
                Number((e.target as HTMLInputElement).value),
                rangeMin,
              );
              commitPriceRange(rangeMin, next);
            }}
          />
        </div>

        <div className="mt-1 flex justify-between text-xs text-ink-muted">
          <span>{formatPrice(boundMin)}</span>
          <span>{formatPrice(boundMax)}</span>
        </div>
      </div>

      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3 xl:col-span-5">
        <button type="submit" className="btn btn-primary">
          Buscar
        </button>
        <label className="ml-auto flex items-center gap-2 text-sm text-ink-muted">
          <input
            type="checkbox"
            checked={searchParams.get("estoque") === "1"}
            onChange={(e) =>
              update("estoque", e.target.checked ? "1" : "todos")
            }
          />
          Só disponíveis
        </label>
      </div>
    </form>
  );
}
