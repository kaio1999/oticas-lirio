"use client";

import { loginAction } from "@/app/admin/actions/auth";
import { PendingSubmitButton } from "@/components/admin/PendingSubmitButton";

type Props = {
  errorMsg?: string | null;
};

export function LoginForm({ errorMsg }: Props) {
  return (
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

      <PendingSubmitButton
        pendingLabel="Entrando…"
        className="btn btn-primary mt-6 w-full disabled:opacity-70"
      >
        Entrar
      </PendingSubmitButton>
    </form>
  );
}
