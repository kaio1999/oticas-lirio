import Link from "next/link";
import { notFound } from "next/navigation";
import { updateProductAction } from "@/app/admin/actions/products";
import { ProductForm } from "@/components/admin/ProductForm";
import { requirePermission } from "@/lib/admin/auth";
import { translateAdminError } from "@/lib/admin/errors";
import { decodeProductIdParam } from "@/lib/admin/productId";
import {
  PRODUCT_ADMIN_COLUMNS,
  mapProductRow,
  type ProductRow,
} from "@/lib/supabase/mappers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ erro?: string }>;

export default async function EditarProdutoPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  await requirePermission("products");
  const { id: rawId } = await params;
  const id = decodeProductIdParam(rawId);
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();
  if (!supabase) notFound();

  const { data } = await supabase
    .from("products")
    .select(PRODUCT_ADMIN_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const product = mapProductRow(data as ProductRow);
  const erroMsg = sp.erro
    ? translateAdminError(decodeURIComponent(sp.erro))
    : null;

  return (
    <div>
      <Link
        href="/admin/produtos"
        className="text-sm text-ink-muted hover:text-brand-ink"
      >
        ← Voltar
      </Link>
      <h1 className="mt-3 font-display text-4xl text-brand-ink">
        Editar: {product.name}
      </h1>
      <div className="mt-6">
        <ProductForm
          action={updateProductAction}
          product={product}
          submitLabel="Salvar alterações"
          error={erroMsg}
        />
      </div>
    </div>
  );
}
