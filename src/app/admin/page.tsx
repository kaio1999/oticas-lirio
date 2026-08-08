import { AdminFlash } from "@/components/admin/AdminFlash";
import { AdminNavLink } from "@/components/admin/AdminNavLink";
import { requireAdmin } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProducts } from "@/services/products";

type SearchParams = Promise<{ erro?: string }>;

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [profile, params, products] = await Promise.all([
    requireAdmin(),
    searchParams,
    getProducts(),
  ]);

  const productCount = products.length;
  let staffCount = 0;

  if (profile.canManageTeam) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { count } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });
      staffCount = count ?? 0;
    }
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-brand-ink">
        Olá, {profile.fullName.split(" ")[0]}
      </h1>
      <p className="mt-2 text-ink-muted">Painel de gestão da Óticas Lírio.</p>

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
          <AdminNavLink
            href="/admin/produtos"
            className="rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:border-brand/40"
          >
            <span className="block">
              <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
                Catálogo
              </p>
              <p className="mt-2 font-display text-3xl text-brand-ink">
                {productCount} produtos
              </p>
              <p className="mt-2 text-sm text-brand-ink">Gerenciar óculos →</p>
            </span>
          </AdminNavLink>
        ) : null}

        {profile.canManageTeam ? (
          <AdminNavLink
            href="/admin/equipe"
            className="rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:border-brand/40"
          >
            <span className="block">
              <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
                Equipe
              </p>
              <p className="mt-2 font-display text-3xl text-brand-ink">
                {staffCount} pessoas
              </p>
              <p className="mt-2 text-sm text-brand-ink">Controle de acessos →</p>
            </span>
          </AdminNavLink>
        ) : null}

        {profile.role === "owner" ? (
          <AdminNavLink
            href="/admin/horarios"
            className="rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:border-brand/40"
          >
            <span className="block">
              <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
                Loja
              </p>
              <p className="mt-2 font-display text-3xl text-brand-ink">
                Horários
              </p>
              <p className="mt-2 text-sm text-brand-ink">
                Abertura e fechamento →
              </p>
            </span>
          </AdminNavLink>
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

        <AdminNavLink
          href="/admin/ajuda"
          className="rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:border-brand/40"
        >
          <span className="block">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
              Tutorial
            </p>
            <p className="mt-2 font-display text-3xl text-brand-ink">Ajuda</p>
            <p className="mt-2 text-sm text-brand-ink">Como usar o painel →</p>
          </span>
        </AdminNavLink>
      </div>
    </div>
  );
}
