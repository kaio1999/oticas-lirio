import type { Metadata } from "next";
import Link from "next/link";
import { ContactLink } from "@/components/TrackedCta";
import { getStoreInfo } from "@/services/store";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "A loja",
  description: "Conheça a história, os valores e os diferenciais da Óticas Lírio.",
};

export default async function SobrePage() {
  const store = await getStoreInfo();

  return (
    <div className="container-page py-12 md:py-16">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand-ink">
            A loja
          </p>
          <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
            Clareza, delicadeza e acolhimento
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
            {store.story}
          </p>
        </div>

        <div className="panel-brand relative overflow-hidden rounded-[1.75rem] p-10 shadow-[0_24px_50px_#0d5c6620]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/logo-branco-circulo.svg"
            alt="Logo Óticas Lírio"
            width={420}
            height={420}
            decoding="async"
            className="logo-on-dark mx-auto h-auto w-full max-w-xs object-contain"
          />
        </div>
      </div>

      <section className="mt-16">
        <h2 className="font-display text-3xl text-ink sm:text-4xl">
          O que nos guia
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {store.values.map((value) => (
            <article
              key={value.title}
              className="h-full rounded-3xl border border-line bg-white p-6 shadow-[0_10px_30px_#12121208]"
            >
              <h3 className="font-display text-2xl text-ink">{value.title}</h3>
              <p className="mt-3 text-ink-muted">{value.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel-brand mt-16 rounded-[2rem] px-8 py-10 md:px-12">
        <h2 className="font-display text-3xl sm:text-4xl">Diferenciais</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {store.differentials.map((item) => (
            <li key={item} className="flex items-start gap-3 text-white/85">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/fundadora" className="btn btn-accent">
            Conhecer a fundadora
          </Link>
          <ContactLink place="sobre" className="btn btn-ghost-light">
            Visitar a loja
          </ContactLink>
        </div>
      </section>
    </div>
  );
}
