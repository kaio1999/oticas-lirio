import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductPrice } from "@/components/ProductPrice";
import { ContactLink, WhatsAppLink } from "@/components/TrackedCta";
import { decodeProductIdParam } from "@/lib/admin/productId";
import {
  categoryLabels,
  productDisplayName,
  productGenderLabel,
  shapeLabels,
} from "@/lib/format";
import { whatsappUrl } from "@/lib/whatsapp";
import { getProductById, getProducts } from "@/services/products";

export const revalidate = 60;

type Params = Promise<{ id: string }>;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ id: p.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id: rawId } = await params;
  const id = decodeProductIdParam(rawId);
  const product = await getProductById(id);
  if (!product) return { title: "Produto" };
  return {
    title: productDisplayName(product.name, product.brand),
    description: product.description,
  };
}

export default async function ProdutoDetalhePage({
  params,
}: {
  params: Params;
}) {
  const { id: rawId } = await params;
  const id = decodeProductIdParam(rawId);
  const product = await getProductById(id);
  if (!product) notFound();
  const title = productDisplayName(product.name, product.brand);

  return (
    <div className="container-page py-12 md:py-16">
      <Link
        href="/produtos"
        className="text-sm text-ink-muted transition hover:text-brand"
      >
        ← Voltar ao catálogo
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:items-start">
        <ProductGallery
          images={product.images}
          imageCrops={product.imageCrops}
          alt={title}
          priority
          product={product}
        />

        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">
            {categoryLabels[product.category]} · {shapeLabels[product.shape]} ·{" "}
            {productGenderLabel(product.gender)}
          </p>
          <h1 className="mt-2 font-display text-4xl text-brand sm:text-5xl">
            {title}
          </h1>
          <ProductPrice
            price={product.price}
            promoPrice={product.promoPrice}
            size="detail"
          />
          <p className="mt-5 max-w-lg text-ink-muted">{product.description}</p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white/60 p-4">
              <dt className="text-xs uppercase tracking-[0.12em] text-ink-muted">
                Gênero
              </dt>
              <dd className="mt-1 text-brand">
                {productGenderLabel(product.gender)}
              </dd>
            </div>
            <div className="rounded-2xl border border-line bg-white/60 p-4">
              <dt className="text-xs uppercase tracking-[0.12em] text-ink-muted">
                Material
              </dt>
              <dd className="mt-1 text-brand">{product.material}</dd>
            </div>
            <div className="rounded-2xl border border-line bg-white/60 p-4">
              <dt className="text-xs uppercase tracking-[0.12em] text-ink-muted">
                Cores
              </dt>
              <dd className="mt-1 text-brand">{product.colors.join(", ")}</dd>
            </div>
            <div className="rounded-2xl border border-line bg-white/60 p-4 sm:col-span-2">
              <dt className="text-xs uppercase tracking-[0.12em] text-ink-muted">
                Disponibilidade
              </dt>
              <dd className="mt-1 text-brand">
                {product.inStock
                  ? "Disponível para consulta na loja"
                  : "Indisponível no momento — consulte interesse"}
              </dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <WhatsAppLink
              href={whatsappUrl(
                `Olá! Tenho interesse no modelo ${title} (${product.id}).`,
              )}
              place="produto_detalhe"
              className="btn btn-primary"
            >
              Falar com a loja
            </WhatsAppLink>
            <ContactLink place="produto_detalhe" className="btn btn-secondary">
              Como chegar
            </ContactLink>
          </div>
        </div>
      </div>
    </div>
  );
}
