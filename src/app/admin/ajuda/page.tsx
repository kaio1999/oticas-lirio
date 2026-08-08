import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Ajuda · Admin",
  robots: { index: false, follow: false },
};

const steps = [
  {
    title: "Entrar no painel",
    body: "Acesse o admin com o e-mail e a senha que você recebeu. Depois de entrar, use o menu no topo para navegar.",
    tip: "Se esquecer a senha, peça para quem gerencia o site redefinir no Supabase ou trocar por você.",
  },
  {
    title: "Ver como ficou no site",
    body: "No menu, toque em “Ver site”. Abre a loja em outra aba — útil para conferir depois de cadastrar ou editar um produto.",
    href: "/",
    hrefLabel: "Abrir o site",
    external: true,
  },
  {
    title: "Cadastrar um produto",
    body: "Vá em Produtos → Novo produto. Preencha nome, marca e preço. A foto é obrigatória na criação: sem foto, não salva.",
    tip: "A primeira foto é a capa (aparece no catálogo e na home). Você pode trocar a capa depois com “Usar como capa”.",
    href: "/admin/produtos/novo",
    hrefLabel: "Novo produto",
    needsProducts: true,
  },
  {
    title: "Colocar em promoção",
    body: "No formulário do produto, marque “Em promoção (de / para)” e digite o preço promocional. Ele precisa ser menor que o preço cheio.",
    tip: "No site aparece o preço riscado e o valor novo, com a tag de desconto (−XX%).",
  },
  {
    title: "Destacar na home",
    body: "Marque “Destaque na home”. Esses modelos aparecem no carrossel “Modelos em evidência” da página inicial.",
    tip: "Não precisa marcar muitos — 3 ou 4 bons já bastam.",
  },
  {
    title: "Estoque e indisponível",
    body: "Na lista de produtos, use o botão “Em estoque” / “Indisponível”. No site, o modelo some da disponibilidade ou ganha o aviso correspondente.",
    href: "/admin/produtos",
    hrefLabel: "Ver produtos",
    needsProducts: true,
  },
  {
    title: "Editar ou excluir",
    body: "Na lista, abra o produto para editar. Para excluir, use a opção de exclusão na página do produto — isso remove também as fotos do armazenamento.",
    needsProducts: true,
  },
  {
    title: "Cadastrar alguém da equipe",
    body: "Só a dona vê Equipe. Lá você cria o acesso, define a senha inicial e marca se a pessoa pode cuidar de produtos e/ou da equipe.",
    href: "/admin/equipe",
    hrefLabel: "Abrir equipe",
    needsTeam: true,
  },
  {
    title: "Alterar horários da loja",
    body: "Só a dona vê Horários. Lá você muda abertura e fechamento (ex.: Segunda a sexta 09h – 18h) ou marca o dia como fechado. O site Contato atualiza na hora.",
    tip: "Use o mesmo formato que a cliente entende: “09h – 18h” ou “Fechado”.",
    href: "/admin/horarios",
    hrefLabel: "Editar horários",
    needsOwner: true,
  },
] as const;

export default async function AdminAjudaPage() {
  const profile = await requireAdmin();

  const visibleSteps = steps.filter((step) => {
    if ("needsProducts" in step && step.needsProducts && !profile.canManageProducts) {
      return false;
    }
    if ("needsTeam" in step && step.needsTeam && !profile.canManageTeam) {
      return false;
    }
    if ("needsOwner" in step && step.needsOwner && profile.role !== "owner") {
      return false;
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
        Tutorial
      </p>
      <h1 className="mt-2 font-display text-4xl text-brand-ink">
        Como usar o admin
      </h1>
      <p className="mt-3 text-ink-muted">
        Guia rápido do dia a dia — sem termos técnicos. Em caso de dúvida,
        chame quem montou o site.
      </p>

      <ol className="mt-10 space-y-4">
        {visibleSteps.map((step, index) => (
          <li
            key={step.title}
            className="rounded-2xl border border-line bg-white p-5 shadow-sm"
          >
            <div className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-deep text-sm font-semibold text-white">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-2xl text-brand-ink">
                  {step.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {step.body}
                </p>
                {"tip" in step && step.tip ? (
                  <p className="mt-3 rounded-xl bg-sand/80 px-3 py-2 text-xs leading-relaxed text-ink-muted">
                    <span className="font-medium text-brand-ink">Dica: </span>
                    {step.tip}
                  </p>
                ) : null}
                {"href" in step && step.href ? (
                  <p className="mt-3">
                    {"external" in step && step.external ? (
                      <a
                        href={step.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-brand-ink underline decoration-brand/40 underline-offset-4 hover:decoration-brand"
                      >
                        {step.hrefLabel} →
                      </a>
                    ) : (
                      <Link
                        href={step.href}
                        className="text-sm font-medium text-brand-ink underline decoration-brand/40 underline-offset-4 hover:decoration-brand"
                      >
                        {step.hrefLabel} →
                      </Link>
                    )}
                  </p>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 rounded-2xl border border-dashed border-line bg-sand/40 px-5 py-6 text-center">
        <p className="font-display text-2xl text-brand-ink">Ainda com dúvida?</p>
        <p className="mt-2 text-sm text-ink-muted">
          Peça ajuda a quem configurou o painel — é mais rápido do que tentar
          adivinhar.
        </p>
        <Link
          href="/admin"
          className="btn btn-secondary mt-5 inline-flex"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
