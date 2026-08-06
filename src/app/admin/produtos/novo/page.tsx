import Link from "next/link";
import { createProductAction } from "@/app/admin/actions/products";
import { ProductForm } from "@/components/admin/ProductForm";
import { requirePermission } from "@/lib/admin/auth";
import { translateAdminError } from "@/lib/admin/errors";

type SearchParams = Promise<{ erro?: string }>;

export default async function NovoProdutoPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requirePermission("products");
  const params = await searchParams;
  const erroMsg = params.erro
    ? translateAdminError(decodeURIComponent(params.erro))
    : null;

  return (
    <div>
      <Link
        href="/admin/produtos"
        className="text-sm text-ink-muted hover:text-brand-ink"
      >
        ← Voltar
      </Link>
      <h1 className="mt-3 font-display text-4xl text-brand-ink">Novo produto</h1>
      <div className="mt-6">
        <ProductForm
          action={createProductAction}
          submitLabel="Cadastrar"
          error={erroMsg}
        />
      </div>
    </div>
  );
}
