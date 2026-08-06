import Link from "next/link";
import { MobileNav } from "@/components/MobileNav";

const links = [
  { href: "/produtos", label: "Catálogo" },
  { href: "/sobre", label: "A loja" },
  { href: "/fundadora", label: "Fundadora" },
  { href: "/contato", label: "Contato" },
];

/** Header server-side — JS só no menu mobile. */
export function Header() {
  return (
    <header className="relative sticky top-0 z-50 border-b border-line bg-[#faf9f7] md:bg-[#faf9f7e6] md:backdrop-blur-md">
      <div className="container-page flex items-center justify-between gap-4 py-3">
        <Link href="/" className="group flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/simbolo-flor.svg"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 object-contain transition duration-500 group-hover:rotate-12"
            decoding="async"
          />
          <span className="font-display text-xl tracking-wide text-brand-ink sm:text-2xl">
            Óticas Lírio
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-sand hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <MobileNav />
      </div>
    </header>
  );
}
