import type { Metadata } from "next";
import Link from "next/link";
import { ParallaxPortrait } from "@/components/ParallaxPortrait";
import { WhatsAppLink } from "@/components/TrackedCta";
import { storeInfo } from "@/data/store";
import { whatsappUrl } from "@/lib/whatsapp";
import { getStoreInfo } from "@/services/store";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Fundadora",
  description: `Conheça ${storeInfo.founder.name}, fundadora da Óticas Lírio.`,
};

export default async function FundadoraPage() {
  const store = await getStoreInfo();

  return (
    <div className="container-page py-12 md:py-16">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
        <div className="mx-auto w-full max-w-lg lg:max-w-none">
          <ParallaxPortrait
            src="/fundadora/juliana-profissional.jpg"
            alt={`${store.founder.name}, fundadora da Óticas Lírio`}
            priority
          />
        </div>

        <div className="lg:pt-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand-ink">
            {store.founder.role}
          </p>
          <h1 className="mt-2 font-display text-4xl text-brand-ink sm:text-5xl">
            {store.founder.name}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-muted">
            {store.founder.shortBio}
          </p>
          <p className="mt-5 max-w-xl leading-relaxed text-ink-muted">
            {store.founder.bio}
          </p>

          <blockquote className="mt-8 border-l-2 border-brand pl-5 font-display text-2xl leading-snug text-brand-ink">
            “Cada óculos bem escolhido é um convite a se enxergar com mais
            confiança.”
          </blockquote>

          <div className="mt-8 flex flex-wrap gap-3">
            <WhatsAppLink
              href={whatsappUrl(
                `Olá, ${store.founder.name}! Vim pelo site e gostaria de conversar.`,
              )}
              place="fundadora"
              className="btn btn-whatsapp"
            >
              Falar no WhatsApp
            </WhatsAppLink>
            <Link href="/sobre" className="btn btn-secondary">
              Sobre a loja
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-16 flex items-center gap-4 rounded-[1.75rem] border border-line bg-white/80 px-6 py-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/simbolo-flor.svg"
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 shrink-0 object-contain"
          decoding="async"
          loading="lazy"
        />
        <p className="text-sm text-ink-muted">
          <span className="font-medium text-brand-ink">{store.slogan}</span>
          {" — "}a marca nasceu do cuidado de Juliana com cada atendimento.
        </p>
      </div>
    </div>
  );
}
