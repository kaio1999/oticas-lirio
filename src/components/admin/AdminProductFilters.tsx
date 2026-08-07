"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { categoryLabels } from "@/lib/format";

const categories = ["todos", "grau", "sol", "infantil", "acessorio"] as const;

type Props = {
  brands: string[];
};

/** Filtros do admin: atualizam a URL → servidor filtra/pagina. */
export function AdminProductFilters({ brands }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function push(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    // Nova busca volta à página 1
    params.delete("page");
    // Mantém ok/erro só na primeira carga; limpa ao filtrar
    params.delete("ok");
    params.delete("erro");
    startTransition(() => {
      router.push(`/admin/produtos?${params.toString()}`);
    });
  }

  function setFilter(key: string, value: string) {
    push((params) => {
      if (!value || value === "todos") params.delete(key);
      else params.set(key, value);
    });
  }

  return (
    <form
      className={`mt-6 grid gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-5 ${pending ? "opacity-70" : ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        push((params) => {
          const q = String(fd.get("q") || "").trim();
          if (q) params.set("q", q);
          else params.delete("q");
        });
      }}
    >
      <label className="block sm:col-span-2 lg:col-span-2">
        <span className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-ink-muted">
          Busca
        </span>
        <input
          name="q"
          defaultValue={searchParams.get("q") ?? ""}
          placeholder="Nome, marca, ID, SKU, material…"
          className="w-full rounded-xl border border-line px-3 py-2.5 outline-none ring-brand/30 focus:ring-2"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-ink-muted">
          Marca
        </span>
        <select
          className="w-full rounded-xl border border-line px-3 py-2.5 outline-none ring-brand/30 focus:ring-2"
          value={searchParams.get("marca") ?? "todos"}
          onChange={(e) => setFilter("marca", e.target.value)}
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
          className="w-full rounded-xl border border-line px-3 py-2.5 outline-none ring-brand/30 focus:ring-2"
          value={searchParams.get("categoria") ?? "todos"}
          onChange={(e) => setFilter("categoria", e.target.value)}
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
          Estoque
        </span>
        <select
          className="w-full rounded-xl border border-line px-3 py-2.5 outline-none ring-brand/30 focus:ring-2"
          value={searchParams.get("estoque") ?? "todos"}
          onChange={(e) => setFilter("estoque", e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="1">Em estoque</option>
          <option value="0">Indisponível</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-ink-muted">
          Destaque
        </span>
        <select
          className="w-full rounded-xl border border-line px-3 py-2.5 outline-none ring-brand/30 focus:ring-2"
          value={searchParams.get("destaque") ?? "todos"}
          onChange={(e) => setFilter("destaque", e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="1">Em destaque</option>
          <option value="0">Sem destaque</option>
        </select>
      </label>

      <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-5">
        <button type="submit" className="btn btn-primary !min-h-10 !px-4 !text-sm">
          Buscar
        </button>
        <button
          type="button"
          className="btn btn-secondary !min-h-10 !px-4 !text-sm"
          onClick={() => {
            startTransition(() => {
              router.push("/admin/produtos");
            });
          }}
        >
          Limpar
        </button>
      </div>
    </form>
  );
}
