import {
  createStaffAction,
  updateStaffAction,
} from "@/app/admin/actions/team";
import { AdminFlash } from "@/components/admin/AdminFlash";
import { requirePermission } from "@/lib/admin/auth";
import { translateAdminError } from "@/lib/admin/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapProfile, type ProfileRow } from "@/types/admin";

type SearchParams = Promise<{ ok?: string; erro?: string }>;

export default async function EquipePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const actor = await requirePermission("team");
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  const { data } = supabase
    ? await supabase.from("profiles").select("*").order("created_at")
    : { data: [] };

  const team = ((data || []) as ProfileRow[]).map(mapProfile);
  const erroMsg = params.erro
    ? translateAdminError(decodeURIComponent(params.erro))
    : null;

  return (
    <div>
      <h1 className="font-display text-4xl text-brand-ink">Equipe e acessos</h1>
      <p className="mt-2 max-w-2xl text-ink-muted">
        Controle quem entra no admin e o que cada pessoa pode fazer. Só quem tem
        permissão de equipe (em geral a dona) gerencia isso.
      </p>

      <AdminFlash
        message={params.ok ? "Equipe atualizada." : erroMsg}
        variant={erroMsg ? "error" : "success"}
      />

      <section className="mt-8 rounded-2xl border border-line bg-white p-6">
        <h2 className="font-display text-2xl text-brand-ink">
          Adicionar funcionária
        </h2>
        <form action={createStaffAction} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Nome completo *
            <input
              name="fullName"
              required
              className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5"
            />
          </label>
          <label className="block text-sm font-medium">
            E-mail *
            <input
              name="email"
              type="email"
              required
              className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5"
            />
          </label>
          <label className="block text-sm font-medium sm:col-span-2">
            Senha inicial * (mín. 8)
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="canManageProducts"
              defaultChecked
              className="size-4"
            />
            Pode gerenciar produtos
          </label>
          {actor.role === "owner" ? (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="canManageTeam" className="size-4" />
              Pode gerenciar equipe
            </label>
          ) : null}
          <div className="sm:col-span-2">
            <button type="submit" className="btn btn-primary">
              Criar acesso
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="font-display text-2xl text-brand-ink">Quem tem acesso</h2>
        {team.map((member) => (
          <form
            key={member.id}
            action={updateStaffAction}
            className="rounded-2xl border border-line bg-white p-5"
          >
            <input type="hidden" name="id" value={member.id} />
            <input type="hidden" name="role" value={member.role} />

            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-ink-muted">
                  {member.role === "owner" ? "Dona" : "Equipe"} · {member.email}
                </p>
                <label className="mt-2 block text-sm font-medium">
                  Nome
                  <input
                    name="fullName"
                    required
                    defaultValue={member.fullName}
                    className="mt-1 w-full min-w-[220px] rounded-xl border border-line px-3 py-2"
                  />
                </label>
              </div>
              {member.role !== "owner" ? (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={member.active}
                    className="size-4"
                  />
                  Conta ativa
                </label>
              ) : (
                <input type="hidden" name="active" value="on" />
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="canManageProducts"
                  defaultChecked={member.canManageProducts}
                  disabled={member.role === "owner"}
                  className="size-4"
                />
                Gerenciar produtos
              </label>
              {actor.role === "owner" ? (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="canManageTeam"
                    defaultChecked={member.canManageTeam}
                    disabled={member.role === "owner"}
                    className="size-4"
                  />
                  Gerenciar equipe
                </label>
              ) : null}
            </div>

            {member.role === "owner" ? (
              <p className="mt-3 text-xs text-ink-muted">
                A dona sempre tem acesso total.
              </p>
            ) : (
              <button type="submit" className="btn btn-secondary mt-4 !min-h-9 !text-sm">
                Salvar permissões
              </button>
            )}
          </form>
        ))}
      </section>
    </div>
  );
}
