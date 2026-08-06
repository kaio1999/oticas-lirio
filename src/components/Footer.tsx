import Link from "next/link";
import { getStoreInfo } from "@/services/store";
import { whatsappUrl } from "@/lib/whatsapp";

export async function Footer() {
  const store = await getStoreInfo();

  return (
    <footer className="panel-brand mt-auto border-t border-white/10">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/simbolo-flor-branco.svg"
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
              decoding="async"
              loading="lazy"
            />
            <p className="font-display text-3xl tracking-wide">Óticas Lírio</p>
          </div>
          <p className="mt-4 max-w-sm text-white/70">{store.slogan}</p>
          <p className="mt-2 text-sm text-white/50">
            {store.address.city}/{store.address.state}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-brand">
            Navegação
          </p>
          <ul className="mt-4 space-y-2 text-white/75">
            <li>
              <Link href="/produtos" className="hover:text-white">
                Catálogo
              </Link>
            </li>
            <li>
              <Link href="/sobre" className="hover:text-white">
                A loja
              </Link>
            </li>
            <li>
              <Link href="/fundadora" className="hover:text-white">
                Fundadora
              </Link>
            </li>
            <li>
              <Link href="/contato" className="hover:text-white">
                Contato
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-brand">
            Contato
          </p>
          <ul className="mt-4 space-y-2 text-white/75">
            <li>{store.address.full}</li>
            <li>
              <a href={`tel:+${store.phoneE164}`} className="hover:text-white">
                {store.phone}
              </a>
            </li>
            <li>
              <a
                href={store.instagram}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                {store.instagramHandle}
              </a>
            </li>
            <li>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {store.name}. Todos os direitos
            reservados.
          </p>
          <p>CNPJ {store.cnpj}</p>
        </div>
      </div>
    </footer>
  );
}
