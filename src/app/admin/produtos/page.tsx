import Link from "next/link";
import {
  deleteProductAction,
  toggleStockAction,
} from "@/app/admin/actions/products";
import { AdminFlash } from "@/components/admin/AdminFlash";
import { requirePermission } from "@/lib/admin/auth";
import { translateAdminError } from "@/lib/admin/errors";
import { categoryLabels, formatPrice, shapeLabels } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapProductRow, type ProductRow } from "@/lib/supabase/mappers";

type SearchParams = Promise<{ ok?: string; erro?: string }>;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requirePermission("products");
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  const { data } = supabase
    ? await supabase.from("products").select("*").order("name")
    : { data: [] };

  const products = ((data || []) as ProductRow[]).map(mapProductRow);
  const erroMsg = params.erro
    ? translateAdminError(decodeURIComponent(params.erro))
    : null;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-brand-ink">Produtos</h1>
          <p className="mt-1 text-ink-muted">
            Cadastro e estoque das armações.
          </p>
        </div>
        <Link href="/admin/produtos/novo" className="btn btn-primary">
          Novo produto
        </Link>
      </div>

      <AdminFlash
        message={
          params.ok
            ? "Alteração salva com sucesso."
            : erroMsg
        }
        variant={erroMsg ? "error" : "success"}
      />

      <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-white">
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
                    {shapeLabels[p.shape]} · {p.material}
                  </p>
                </td>
                <td className="px-4 py-3">{categoryLabels[p.category]}</td>
                <td className="px-4 py-3">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">
                  <form action={toggleStockAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <input
                      type="hidden"
                      name="inStock"
                      value={p.inStock ? "true" : "false"}
                    />
                    <button
                      type="submit"
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        p.inStock
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-sand text-ink-muted"
                      }`}
                    >
                      {p.inStock ? "Em estoque" : "Indisponível"}
                    </button>
                  </form>
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  {p.featured ? "Sim" : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/produtos/${p.id}`}
                      className="text-brand-ink underline-offset-2 hover:underline"
                    >
                      Editar
                    </Link>
                    <form action={deleteProductAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className="text-red-600 underline-offset-2 hover:underline"
                      >
                        Excluir
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-muted">
                  Nenhum produto ainda. Crie o primeiro.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
