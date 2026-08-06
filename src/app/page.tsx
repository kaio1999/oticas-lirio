import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { whatsappUrl } from "@/lib/whatsapp";
import { getFeaturedProducts } from "@/services/products";
import { getStoreInfo } from "@/services/store";

/** Cache ISR — melhora TTFB no Lighthouse sem perder dados frescos. */
export const revalidate = 60;

export default async function HomePage() {
  const [featured, store] = await Promise.all([
    getFeaturedProducts(),
    getStoreInfo(),
  ]);

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(165deg,#faf9f7_0%,#f3eee7_48%,#ebe4da_100%)] md:bg-[radial-gradient(ellipse_at_80%_20%,#00b7c81a_0%,transparent_42%),linear-gradient(165deg,#faf9f7_0%,#f3eee7_48%,#ebe4da_100%)]"
        />

        <div className="container-page relative z-10 grid min-h-[min(88vh,820px)] items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-14">
          <div>
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/simbolo-flor.svg"
                alt=""
                width={80}
                height={80}
                className="h-14 w-14 object-contain sm:h-20 sm:w-20 md:animate-spin-slow md:drop-shadow-[0_8px_20px_#00b7c855]"
                decoding="async"
                fetchPriority="high"
              />
              <div>
                <p className="font-display text-3xl leading-none tracking-wide text-brand-ink sm:text-4xl">
                  Óticas Lírio
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  {store.address.city}/{store.address.state}
                </p>
              </div>
            </div>

            <h1 className="mt-8 max-w-xl font-display text-[2.4rem] leading-[1.08] tracking-wide text-brand-ink sm:text-5xl lg:text-[3.4rem]">
              {store.slogan}
            </h1>

            <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-muted">
              Curadoria de armações e atendimento próximo, com o carinho de quem
              entende que cada olhar é único.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/produtos" className="btn btn-primary">
                Ver catálogo
              </Link>
              <Link href="/contato" className="btn btn-accent">
                Falar com a loja
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="panel-brand relative overflow-hidden rounded-[2rem] p-8 shadow-[0_28px_60px_#0d5c6620] sm:p-12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/logo-branco-circulo.svg"
                alt="Óticas Lírio"
                width={400}
                height={400}
                decoding="async"
                fetchPriority="high"
                className="logo-on-dark mx-auto h-auto w-full max-w-xs object-contain sm:max-w-sm"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand-ink">
              Destaques
            </p>
            <h2 className="mt-2 font-display text-4xl text-brand-ink sm:text-5xl">
              Modelos em evidência
            </h2>
          </div>
          <Link href="/produtos" className="btn btn-secondary">
            Ver todos
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.slice(0, 4).map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 2}
            />
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white/50">
        <div className="container-page grid gap-10 py-14 md:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand-ink">
              Atendimento
            </p>
            <h2 className="mt-2 max-w-lg font-display text-4xl text-brand-ink sm:text-5xl">
              Venha escolher com calma, na loja
            </h2>
            <p className="mt-4 max-w-md text-ink-muted">
              Orientação personalizada na escolha da armação e das lentes, com o
              cuidado de quem acompanha cada detalhe.
            </p>
            <Link href="/contato" className="btn btn-primary mt-8">
              Como chegar
            </Link>
          </div>

          <div className="glass-panel rounded-[1.75rem] p-8 md:p-10">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/simbolo-flor.svg"
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
                decoding="async"
                loading="lazy"
              />
            </div>
            <p className="font-display text-3xl text-brand-ink">Como funciona</p>
            <ol className="mt-6 space-y-4 text-ink-muted">
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-deep text-xs font-semibold text-white">
                  1
                </span>
                Explore o catálogo no site
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-deep text-xs font-semibold text-white">
                  2
                </span>
                Fale conosco pelo WhatsApp
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-deep text-xs font-semibold text-white">
                  3
                </span>
                Visite a loja e finalize com a gente
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="flex flex-col gap-6 rounded-[1.75rem] border border-line bg-white/70 px-8 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand-ink">
              Fundadora
            </p>
            <h2 className="mt-2 font-display text-3xl text-brand-ink sm:text-4xl">
              {store.founder.name}
            </h2>
            <p className="mt-2 max-w-lg text-ink-muted">
              Conheça a história por trás da Óticas Lírio.
            </p>
          </div>
          <Link href="/fundadora" className="btn btn-primary shrink-0">
            Ver página da fundadora
          </Link>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-page">
          <div className="panel-brand flex flex-col gap-8 rounded-[2rem] px-8 py-12 md:flex-row md:items-center md:justify-between md:px-12">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl">
                Visite a loja ou chame no WhatsApp
              </h2>
              <p className="mt-3 max-w-lg text-white/75">
                Tire dúvidas, reserve um modelo ou agende sua visita em{" "}
                {store.address.city}.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noreferrer"
                className="btn btn-accent"
              >
                Falar agora
              </a>
              <Link href="/contato" className="btn btn-ghost-light">
                Como chegar
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
