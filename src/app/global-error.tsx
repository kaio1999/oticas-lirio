"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Erro global do App Router → Sentry. */
export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#faf9f7] p-6 text-center text-[#2c4550]">
        <h1 className="text-2xl font-semibold">Algo deu errado</h1>
        <p className="max-w-md text-sm opacity-70">
          Tente novamente. Se o problema continuar, fale conosco pelo WhatsApp.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-[#1499a8] px-5 py-2.5 text-sm font-medium text-white"
        >
          Tentar de novo
        </button>
      </body>
    </html>
  );
}
