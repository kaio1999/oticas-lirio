import { AdminNavLink } from "@/components/admin/AdminNavLink";

type Props = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  /** Query string atual sem `page` (já serializada). */
  baseQuery: string;
};

function hrefFor(baseQuery: string, page: number) {
  const params = new URLSearchParams(baseQuery);
  if (page <= 1) params.delete("page");
  else params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/produtos?${qs}` : "/admin/produtos";
}

export function AdminProductPagination({
  page,
  totalPages,
  total,
  pageSize,
  baseQuery,
}: Props) {
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-ink-muted">
        Mostrando {from}–{to} de {total}
      </p>

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center gap-2">
          <AdminNavLink
            href={hrefFor(baseQuery, page - 1)}
            className={`rounded-full border border-line px-3 py-1.5 ${
              page <= 1
                ? "pointer-events-none opacity-40"
                : "hover:bg-sand"
            }`}
            prefetch={page > 1}
          >
            Anterior
          </AdminNavLink>

          <span className="px-1 text-ink-muted">
            Página {page} de {totalPages}
          </span>

          <AdminNavLink
            href={hrefFor(baseQuery, page + 1)}
            className={`rounded-full border border-line px-3 py-1.5 ${
              page >= totalPages
                ? "pointer-events-none opacity-40"
                : "hover:bg-sand"
            }`}
            prefetch={page < totalPages}
          >
            Próxima
          </AdminNavLink>
        </div>
      ) : null}
    </div>
  );
}
