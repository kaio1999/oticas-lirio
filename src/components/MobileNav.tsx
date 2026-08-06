"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/produtos", label: "Catálogo" },
  { href: "/sobre", label: "A loja" },
  { href: "/fundadora", label: "Fundadora" },
  { href: "/contato", label: "Contato" },
];

/** Só o menu mobile precisa de estado — isola o JS do header. */
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 text-ink"
        aria-expanded={open}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex flex-col gap-1.5" aria-hidden>
          <span
            className={`block h-0.5 w-4 bg-current transition ${open ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-4 bg-current transition ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-4 bg-current transition ${open ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </span>
      </button>

      {open ? (
        <nav className="absolute inset-x-0 top-full border-b border-line bg-marble px-4 py-3 shadow-sm">
          <ul className="container-page flex flex-col gap-1 !w-full !max-w-none px-0">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block rounded-xl px-3 py-3 ${
                    pathname === link.href ||
                    pathname.startsWith(`${link.href}/`)
                      ? "bg-brand/15 font-medium text-brand-ink"
                      : "text-ink"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
