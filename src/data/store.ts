import type { StoreInfo } from "@/types/store";

export const storeInfo: StoreInfo = {
  name: "Óticas Lírio",
  legalName: "J.S.G PEREIRA OPTICA",
  cnpj: "44.922.846/0001-54",
  slogan: "Um amor por cada óculos!",
  founder: {
    name: "Juliana Sandanielo Galante",
    role: "Fundadora",
    bio: "Juliana criou a Óticas Lírio para unir cuidado visual, elegância e atendimento próximo. Cada cliente é recebido com atenção — da escolha da armação ao ajuste fino das lentes.",
    shortBio:
      "Empreendedora apaixonada por ótica e pelo poder que um óculos bem escolhido tem de transformar a confiança de alguém.",
  },
  story:
    "A Óticas Lírio nasceu do desejo de oferecer uma experiência óptica acolhedora, com curadoria de armações e lentes de qualidade. O lírio, símbolo da marca, representa delicadeza, renovação e clareza — valores que guiam cada atendimento.",
  values: [
    {
      title: "Atendimento próximo",
      text: "Tempo para ouvir, orientar e encontrar o modelo certo para o seu rosto e o seu dia a dia.",
    },
    {
      title: "Curadoria visual",
      text: "Armações selecionadas com equilíbrio entre estilo, conforto e qualidade óptica.",
    },
    {
      title: "Confiança local",
      text: "Loja física, pessoas reais e compromisso com o resultado final das suas lentes.",
    },
  ],
  differentials: [
    "Atendimento personalizado",
    "Variedade de armações de grau e sol",
    "Orientação na escolha de lentes e tratamentos",
    "Contato direto via WhatsApp",
  ],
  address: {
    street: "Rua Felipe Sabbag, 200 — Loja 04",
    neighborhood: "Centro",
    city: "Ribeirão Pires",
    state: "SP",
    zip: "09400-130",
    full: "Rua Felipe Sabbag, 200 — Loja 04, Centro, Ribeirão Pires — SP, CEP 09400-130",
    mapsQuery: "Rua Felipe Sabbag, 200, Ribeirão Pires, SP",
  },
  phone: "(11) 97431-4460",
  phoneE164: "5511974314460",
  email: "julianasandanielogalante@gmail.com",
  instagram: "https://www.instagram.com/oticaslirio/",
  instagramHandle: "@oticaslirio",
  hours: [
    { days: "Segunda a sexta", time: "09h – 18h" },
    { days: "Sábado", time: "09h – 13h" },
    { days: "Domingo", time: "Fechado" },
  ],
  openedAt: "2022-01-19",
};
