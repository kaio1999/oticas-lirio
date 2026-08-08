import { logoutAction } from "@/app/admin/actions/auth";
import { AdminNavLink } from "@/components/admin/AdminNavLink";
import { PendingSubmitButton } from "@/components/admin/PendingSubmitButton";
import type { AdminProfile } from "@/types/admin";

type Props = {
  profile: AdminProfile;
};

const navClass =
  "shrink-0 rounded-full px-3 py-1.5 text-ink-muted hover:bg-sand hover:text-ink";

export function AdminHeader({ profile }: Props) {
  const firstName = profile.fullName.split(" ")[0] || profile.fullName;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between gap-3 py-3">
          <AdminNavLink
            href="/admin"
            className="min-w-0 shrink font-display text-xl leading-none text-brand-ink sm:text-2xl"
          >
            Admin Lírio
          </AdminNavLink>

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-medium text-brand-ink">
                {firstName}
              </p>
              <p className="hidden truncate text-xs text-ink-muted sm:block">
                {profile.role === "owner" ? "Dona" : "Equipe"} · {profile.email}
              </p>
            </div>
            <form action={logoutAction} className="shrink-0">
              <PendingSubmitButton
                pendingLabel="Saindo…"
                className="btn btn-secondary !min-h-9 !px-3 !text-sm disabled:opacity-70"
              >
                Sair
              </PendingSubmitButton>
            </form>
          </div>
        </div>

        <nav
          className="-mx-4 flex gap-1 overflow-x-auto border-t border-line px-4 py-2 text-sm scrollbar-none"
          aria-label="Admin"
        >
          <AdminNavLink href="/admin" className={navClass}>
            Início
          </AdminNavLink>
          {profile.canManageProducts ? (
            <AdminNavLink href="/admin/produtos" className={navClass}>
              Produtos
            </AdminNavLink>
          ) : null}
          {profile.canManageTeam ? (
            <AdminNavLink href="/admin/equipe" className={navClass}>
              Equipe
            </AdminNavLink>
          ) : null}
          {profile.role === "owner" ? (
            <AdminNavLink href="/admin/horarios" className={navClass}>
              Horários
            </AdminNavLink>
          ) : null}
          <AdminNavLink href="/admin/ajuda" className={navClass}>
            Ajuda
          </AdminNavLink>
          <AdminNavLink href="/" className={navClass} target="_blank" prefetch={false}>
            Ver site
          </AdminNavLink>
        </nav>
      </div>
    </header>
  );
}
