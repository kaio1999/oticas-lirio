import { LoginForm } from "@/components/admin/LoginForm";
import { getAdminProfile } from "@/lib/admin/auth";
import { redirect } from "next/navigation";

type SearchParams = Promise<{ erro?: string }>;

const errors: Record<string, string> = {
  campos: "Preencha e-mail e senha.",
  credenciais: "E-mail ou senha incorretos.",
  "sem-acesso":
    "Sua conta não tem acesso ao admin (perfil inativo ou inexistente).",
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
  const errorMsg = params.erro
    ? errors[params.erro] || "Não foi possível entrar."
    : null;

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
        <h1 className="mt-4 font-display text-3xl text-brand-ink">
          Admin Óticas Lírio
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Acesso restrito à dona e à equipe autorizada.
        </p>
      </div>

      <LoginForm errorMsg={errorMsg} />
    </div>
  );
}
