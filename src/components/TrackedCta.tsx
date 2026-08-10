"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import {
  trackContact,
  trackPhone,
  trackWhatsApp,
  type AnalyticsEvent,
} from "@/lib/analytics";

type Place = string;

type WhatsAppProps = Omit<ComponentProps<"a">, "href"> & {
  href: string;
  place: Place;
  children: ReactNode;
};

/** Link externo WhatsApp com evento GA4. */
export function WhatsAppLink({
  href,
  place,
  children,
  onClick,
  ...rest
}: WhatsAppProps) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    trackWhatsApp(place);
    onClick?.(e);
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      {...rest}
    >
      {children}
    </a>
  );
}

type ContactLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href?: string;
  place: Place;
  children: ReactNode;
};

/** Link interno para /contato com evento GA4. */
export function ContactLink({
  href = "/contato",
  place,
  children,
  onClick,
  ...rest
}: ContactLinkProps) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    trackContact(place);
    onClick?.(e);
  }

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}

type PhoneLinkProps = Omit<ComponentProps<"a">, "href"> & {
  href: string;
  place: Place;
  children: ReactNode;
};

/** Link tel: com evento GA4. */
export function PhoneLink({
  href,
  place,
  children,
  onClick,
  ...rest
}: PhoneLinkProps) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    trackPhone(place);
    onClick?.(e);
  }

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

/** Helper genérico se precisar de outro evento. */
export function trackCtaClick(event: AnalyticsEvent, place: string) {
  if (event === "clique_whatsapp") trackWhatsApp(place);
  else if (event === "clique_contato") trackContact(place);
  else trackPhone(place);
}
