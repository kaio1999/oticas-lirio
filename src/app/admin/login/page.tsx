import { loginAction } from "@/app/admin/actions/auth";
import { getAdminProfile } from "@/lib/admin/auth";
import { redirect } from "next/navigation";

type SearchParams = Promise<{ erro?: string }>;

const errors: Record<string, string> = {
  campos: "Preencha e-mail e senha.",
  credenciais: "E-mail ou senha incorretos.",
  "sem-acesso": "Sua conta não tem acesso ao admin (perfil inativo ou inexistente).",
  config: "Supabase não configurado no servidor.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const profile = await getAdminProfile();
  if (profile) redirect("/admin");

  const params = await searchParams;
  const errorMsg = params.erro ? errors[params.erro] || "Não foi possível entrar." : null;

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/simbolo-flor.svg"
          alt=""
          width={56}
          height={56}
          className="mx-auto h-14 w-14"
        />
        <h1 className="mt-4 font-display text-3xl text-brand-ink">Admin Óticas Lírio</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Acesso restrito à dona e à equipe autorizada.
        </p>
      </div>

      <form
        action={loginAction}
        className="rounded-2xl border border-line bg-white p-6 shadow-sm"
      >
        {errorMsg ? (
          <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMsg}
          </p>
        ) : null}

        <label className="block text-sm font-medium text-brand-ink">
          E-mail
          <input
            type="email"
            name="email"
            required
            autoComplete="username"
            className="mt-1.5 w-full rounded-xl border border-line bg-marble px-3 py-2.5 outline-none focus:border-brand"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-brand-ink">
          Senha
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            minLength={6}
            className="mt-1.5 w-full rounded-xl border border-line bg-marble px-3 py-2.5 outline-none focus:border-brand"
          />
        </label>

        <button type="submit" className="btn btn-primary mt-6 w-full">
          Entrar
        </button>
      </form>
    </div>
  );
}
