import Link from "next/link";
import { logoutAction } from "@/app/admin/actions/auth";
import type { AdminProfile } from "@/types/admin";

type Props = {
  profile: AdminProfile;
};

export function AdminHeader({ profile }: Props) {
  const firstName = profile.fullName.split(" ")[0] || profile.fullName;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto max-w-6xl px-4">
        {/* Linha principal: marca + conta */}
        <div className="flex items-center justify-between gap-3 py-3">
          <Link
            href="/admin"
            className="min-w-0 shrink font-display text-xl leading-none text-brand-ink sm:text-2xl"
          >
            Admin Lírio
          </Link>

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
              <button
                type="submit"
                className="btn btn-secondary !min-h-9 !px-3 !text-sm"
              >
                Sair
              </button>
            </form>
          </div>
        </div>

        {/* Navegação: scroll horizontal no mobile, linha normal no desktop */}
        <nav
          className="-mx-4 flex gap-1 overflow-x-auto border-t border-line px-4 py-2 text-sm scrollbar-none"
          aria-label="Admin"
        >
          <Link
            href="/admin"
            className="shrink-0 rounded-full px-3 py-1.5 text-ink-muted hover:bg-sand hover:text-ink"
          >
            Início
          </Link>
          {profile.canManageProducts ? (
            <Link
              href="/admin/produtos"
              className="shrink-0 rounded-full px-3 py-1.5 text-ink-muted hover:bg-sand hover:text-ink"
            >
              Produtos
            </Link>
          ) : null}
          {profile.canManageTeam ? (
            <Link
              href="/admin/equipe"
              className="shrink-0 rounded-full px-3 py-1.5 text-ink-muted hover:bg-sand hover:text-ink"
            >
              Equipe
            </Link>
          ) : null}
          <Link
            href="/"
            className="shrink-0 rounded-full px-3 py-1.5 text-ink-muted hover:bg-sand hover:text-ink"
            target="_blank"
          >
            Ver site
          </Link>
        </nav>
      </div>
    </header>
  );
}
