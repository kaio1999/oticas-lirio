import Link from "next/link";
import { AdminFlash } from "@/components/admin/AdminFlash";
import { requireAdmin } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SearchParams = Promise<{ erro?: string }>;

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const profile = await requireAdmin();
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  let productCount = 0;
  let staffCount = 0;
  if (supabase) {
    const { count: pc } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });
    productCount = pc ?? 0;

    if (profile.canManageTeam) {
      const { count: sc } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      staffCount = sc ?? 0;
    }
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-brand-ink">Olá, {profile.fullName.split(" ")[0]}</h1>
      <p className="mt-2 text-ink-muted">
        Painel de gestão da Óticas Lírio.
      </p>

      <AdminFlash
        message={
          params.erro === "sem-permissao"
            ? "Você não tem permissão para essa área."
            : null
        }
        variant="warning"
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profile.canManageProducts ? (
          <Link
            href="/admin/produtos"
            className="rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:border-brand/40"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
              Catálogo
            </p>
            <p className="mt-2 font-display text-3xl text-brand-ink">
              {productCount} produtos
            </p>
            <p className="mt-2 text-sm text-brand-ink">Gerenciar óculos →</p>
          </Link>
        ) : null}

        {profile.canManageTeam ? (
          <Link
            href="/admin/equipe"
            className="rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:border-brand/40"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
              Equipe
            </p>
            <p className="mt-2 font-display text-3xl text-brand-ink">
              {staffCount} pessoas
            </p>
            <p className="mt-2 text-sm text-brand-ink">Controle de acessos →</p>
          </Link>
        ) : null}

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:border-brand/40"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
            Site
          </p>
          <p className="mt-2 font-display text-3xl text-brand-ink">Vitrine</p>
          <p className="mt-2 text-sm text-brand-ink">Abrir loja pública →</p>
        </a>
      </div>
    </div>
  );
}
