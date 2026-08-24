import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
          <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">404</p>
          <h1 className="mt-3 font-display text-4xl text-brand">
            Página não encontrada
          </h1>
          <p className="mt-3 max-w-md text-ink-muted">
            O endereço pode ter mudado. Volte ao início ou explore o catálogo.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn btn-primary">
              Início
            </Link>
            <Link href="/produtos" className="btn btn-secondary">
              Catálogo
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
