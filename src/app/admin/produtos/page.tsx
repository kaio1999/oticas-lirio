import { Suspense } from "react";
import {
  deleteProductAction,
  toggleStockAction,
} from "@/app/admin/actions/products";
import { AdminFlash } from "@/components/admin/AdminFlash";
import { AdminNavLink } from "@/components/admin/AdminNavLink";
import { AdminProductFilters } from "@/components/admin/AdminProductFilters";
import { AdminProductPagination } from "@/components/admin/AdminProductPagination";
import { PendingSubmitButton } from "@/components/admin/PendingSubmitButton";
import { requirePermission } from "@/lib/admin/auth";
import { translateAdminError } from "@/lib/admin/errors";
import { adminProductPath } from "@/lib/admin/productId";
import {
  getAdminProductBrands,
  getAdminProductsPage,
} from "@/lib/admin/products";
import { categoryLabels, formatPrice, productHasPromo, shapeLabels } from "@/lib/format";
import type { ProductCategory } from "@/types/product";

type SearchParams = Promise<{
  ok?: string;
  erro?: string;
  q?: string;
  categoria?: string;
  marca?: string;
  estoque?: string;
  destaque?: string;
  page?: string;
}>;

function buildBaseQuery(params: Awaited<SearchParams>) {
  const next = new URLSearchParams();
  if (params.q) next.set("q", params.q);
  if (params.categoria && params.categoria !== "todos") {
    next.set("categoria", params.categoria);
  }
  if (params.marca && params.marca !== "todos") next.set("marca", params.marca);
  if (params.estoque === "1" || params.estoque === "0") {
    next.set("estoque", params.estoque);
  }
  if (params.destaque === "1" || params.destaque === "0") {
    next.set("destaque", params.destaque);
  }
  return next.toString();
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const pageNum = Math.max(1, Number(params.page) || 1);

  const [, brands, result] = await Promise.all([
    requirePermission("products"),
    getAdminProductBrands(),
    getAdminProductsPage({
      q: params.q,
      category: (params.categoria as ProductCategory | "todos") || "todos",
      brand: params.marca || "todos",
      stock:
        params.estoque === "1" || params.estoque === "0"
          ? params.estoque
          : "todos",
      featured:
        params.destaque === "1" || params.destaque === "0"
          ? params.destaque
          : "todos",
      page: pageNum,
    }),
  ]);

  const { products, total, page, pageSize, totalPages } = result;
  const baseQuery = buildBaseQuery(params);
  const erroMsg = params.erro
    ? translateAdminError(decodeURIComponent(params.erro))
    : null;

  const hasFilters = Boolean(
    params.q ||
      (params.categoria && params.categoria !== "todos") ||
      (params.marca && params.marca !== "todos") ||
      params.estoque === "1" ||
      params.estoque === "0" ||
      params.destaque === "1" ||
      params.destaque === "0",
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-brand-ink">Produtos</h1>
          <p className="mt-1 text-ink-muted">
            Cadastro e estoque das armações.
          </p>
        </div>
        <AdminNavLink href="/admin/produtos/novo" className="btn btn-primary">
          Novo produto
        </AdminNavLink>
      </div>

      <AdminFlash
        message={params.ok ? "Alteração salva com sucesso." : erroMsg}
        variant={erroMsg ? "error" : "success"}
      />

      <Suspense
        fallback={
          <div className="mt-6 h-36 animate-pulse rounded-2xl bg-white/70" />
        }
      >
        <AdminProductFilters brands={brands} />
      </Suspense>

      <p className="mt-4 text-sm text-ink-muted">
        {total}{" "}
        {total === 1 ? "produto encontrado" : "produtos encontrados"}
        {hasFilters ? " com os filtros atuais" : ""}
      </p>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line bg-sand/50 text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium">Preço</th>
              <th className="px-4 py-3 font-medium">Estoque</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                Destaque
              </th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-brand-ink">{p.name}</p>
                  <p className="text-xs text-ink-muted">
                    {p.sku ? `SKU ${p.sku} · ` : ""}
                    {p.brand} · {shapeLabels[p.shape]} · {p.material}
                  </p>
                </td>
                <td className="px-4 py-3">{categoryLabels[p.category]}</td>
                <td className="px-4 py-3">
                  {productHasPromo(p) ? (
                    <div className="space-y-0.5">
                      <p className="text-xs text-ink-muted line-through">
                        {formatPrice(p.price)}
                      </p>
                      <p className="font-medium text-brand-ink">
                        {formatPrice(Number(p.promoPrice))}
                        <span className="ml-1.5 rounded-full bg-brand/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-brand-ink">
                          Promo
                        </span>
                      </p>
                    </div>
                  ) : (
                    formatPrice(p.price)
                  )}
                </td>
                <td className="px-4 py-3">
                  <form action={toggleStockAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <input
                      type="hidden"
                      name="inStock"
                      value={p.inStock ? "true" : "false"}
                    />
                    <PendingSubmitButton
                      pendingLabel="…"
                      className={`rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-70 ${
                        p.inStock
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-sand text-ink-muted"
                      }`}
                    >
                      {p.inStock ? "Em estoque" : "Indisponível"}
                    </PendingSubmitButton>
                  </form>
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  {p.featured ? "Sim" : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <AdminNavLink
                      href={adminProductPath(p.id)}
                      className="text-brand-ink underline-offset-2 hover:underline"
                    >
                      Editar
                    </AdminNavLink>
                    <form action={deleteProductAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <PendingSubmitButton
                        pendingLabel="Excluindo…"
                        className="text-red-600 underline-offset-2 hover:underline disabled:opacity-70"
                      >
                        Excluir
                      </PendingSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-ink-muted"
                >
                  {hasFilters
                    ? "Nenhum produto com esses filtros."
                    : "Nenhum produto ainda. Crie o primeiro."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <AdminProductPagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        baseQuery={baseQuery}
      />
    </div>
  );
}
