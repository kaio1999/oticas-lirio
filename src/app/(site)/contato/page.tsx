import type { Metadata } from "next";
import { PhoneLink, WhatsAppLink } from "@/components/TrackedCta";
import { getStoreInfo } from "@/services/store";
import { whatsappUrl } from "@/lib/whatsapp";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Contato",
  description: "Endereço, horários e canais de atendimento da Óticas Lírio.",
};

export default async function ContatoPage() {
  const store = await getStoreInfo();
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    store.address.mapsQuery,
  )}`;
  const mapsEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(
    store.address.mapsQuery,
  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="container-page py-12 md:py-16">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">
          Contato
        </p>
        <h1 className="mt-2 font-display text-4xl text-brand sm:text-5xl">
          Estamos prontos para receber você
        </h1>
        <p className="mt-3 text-ink-muted">
          Tire dúvidas, confirme disponibilidade ou combine sua visita.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <article className="rounded-3xl border border-line bg-white/70 p-6">
            <h2 className="font-display text-2xl text-brand">Endereço</h2>
            <p className="mt-3 text-ink-muted">{store.address.full}</p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary mt-5"
            >
              Abrir no Maps
            </a>
          </article>

          <article className="rounded-3xl border border-line bg-white/70 p-6">
            <h2 className="font-display text-2xl text-brand">Horários</h2>
            <ul className="mt-4 space-y-2">
              {store.hours.map((row) => (
                <li
                  key={row.days}
                  className="flex items-center justify-between gap-4 border-b border-line py-2 text-sm last:border-0"
                >
                  <span className="text-ink-muted">{row.days}</span>
                  <span className="font-medium text-brand">{row.time}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-muted">
              Horários sujeitos a confirmação — confirme pelo WhatsApp se
              necessário.
            </p>
          </article>

          <article className="rounded-3xl border border-line bg-white/70 p-6">
            <h2 className="font-display text-2xl text-brand">Canais</h2>
            <ul className="mt-4 space-y-3 text-ink-muted">
              <li>
                Telefone:{" "}
                <PhoneLink
                  href={`tel:+${store.phoneE164}`}
                  place="contato"
                  className="text-brand hover:underline"
                >
                  {store.phone}
                </PhoneLink>
              </li>
              <li>
                Instagram:{" "}
                <a
                  href={store.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand hover:underline"
                >
                  {store.instagramHandle}
                </a>
              </li>
              <li>
                E-mail:{" "}
                <a
                  href={`mailto:${store.email}`}
                  className="text-brand hover:underline"
                >
                  {store.email}
                </a>
              </li>
            </ul>
            <WhatsAppLink
              href={whatsappUrl()}
              place="contato"
              className="btn btn-whatsapp mt-5"
            >
              Conversar no WhatsApp
            </WhatsAppLink>
          </article>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-line bg-mist-deep shadow-[0_20px_50px_#1c3d3210]">
          <iframe
            title={`Mapa — ${store.name}`}
            src={mapsEmbed}
            className="h-[min(560px,70vh)] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
