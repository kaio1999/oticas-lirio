import type { Metadata } from "next";
import { StoreHoursForm } from "@/components/admin/StoreHoursForm";
import { translateAdminError } from "@/lib/admin/errors";
import { requireOwner } from "@/lib/admin/auth";
import { getStoreInfo } from "@/services/store";

export const metadata: Metadata = {
  title: "Horários · Admin",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ erro?: string; ok?: string }>;

export default async function AdminHorariosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireOwner();
  const [store, params] = await Promise.all([getStoreInfo(), searchParams]);

  const erroMsg = params.erro
    ? translateAdminError(decodeURIComponent(params.erro))
    : null;

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
        Loja
      </p>
      <h1 className="mt-2 font-display text-4xl text-brand-ink">
        Horários de funcionamento
      </h1>
      <p className="mt-3 text-ink-muted">
        Altere abertura e fechamento. Só a dona pode editar. As mudanças
        aparecem na página Contato do site.
      </p>

      <div className="mt-8">
        <StoreHoursForm
          initialHours={store.hours}
          error={erroMsg}
          success={params.ok === "1"}
        />
      </div>
    </div>
  );
}
