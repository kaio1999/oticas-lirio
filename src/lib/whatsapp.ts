import { storeInfo } from "@/data/store";

export function whatsappUrl(message?: string): string {
  const text =
    message ??
    `Olá, ${storeInfo.name}! Vi o site e gostaria de mais informações.`;
  return `https://wa.me/${storeInfo.phoneE164}?text=${encodeURIComponent(text)}`;
}
