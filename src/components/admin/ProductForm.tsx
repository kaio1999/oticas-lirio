"use client";

import { useState } from "react";
import { AdminFlash } from "@/components/admin/AdminFlash";
import { CurrencyInput } from "@/components/admin/CurrencyInput";
import {
  ProductFormShell,
  ProductImagesField,
} from "@/components/admin/ProductImagesField";
import { productHasPromo } from "@/lib/format";
import type { Product, ProductCategory, ProductShape } from "@/types/product";

const categories: ProductCategory[] = ["grau", "sol", "infantil", "acessorio"];
const shapes: ProductShape[] = [
  "aviador",
  "redondo",
  "quadrado",
  "gatinho",
  "retangular",
  "outro",
];

type Props = {
  action: (formData: FormData) => Promise<void>;
  product?: Product;
  submitLabel: string;
  error?: string | null;
};

export function ProductForm({ action, product, submitLabel, error }: Props) {
  const isCreate = !product;
  const [onPromo, setOnPromo] = useState(
    product ? productHasPromo(product) : false,
  );

  return (
    <ProductFormShell
      action={action}
      submitLabel={submitLabel}
      requireImages={isCreate}
      className="space-y-5 rounded-2xl border border-line bg-white p-6"
    >
      <AdminFlash message={error} variant="error" className="" />

      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      {!product ? (
        <label className="block text-sm font-medium">
          ID (opcional)
          <input
            name="id"
            placeholder="ex: lirio-aviador-13"
            pattern="[A-Za-z0-9\-]+"
            title="Use apenas letras, números e hífens — sem espaços"
            className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5"
          />
          <span className="mt-1 block text-xs text-ink-muted">
            Sem espaços. Se tiver espaço ou acento, vira hífen automaticamente
            (ex.: “teste 123” → “teste-123”).
          </span>
        </label>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium sm:col-span-2">
          Nome *
          <input
            name="name"
            required
            defaultValue={product?.name}
            className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5"
          />
        </label>

        <label className="block text-sm font-medium">
          Marca *
          <input
            name="brand"
            required
            defaultValue={product?.brand ?? ""}
            placeholder="Ex.: Ray-Ban, Oakley…"
            className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5"
          />
        </label>

        <label className="block text-sm font-medium">
          Preço *
          <div className="mt-1.5">
            <CurrencyInput
              name="price"
              required
              defaultValue={product?.price ?? 0}
            />
          </div>
          <span className="mt-1 block text-xs text-ink-muted">
            Digite os centavos: 10050 vira R$ 100,50
          </span>
        </label>

        <div className="space-y-3 rounded-xl border border-dashed border-brand/30 bg-brand/5 p-3 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="onPromo"
              checked={onPromo}
              onChange={(e) => setOnPromo(e.target.checked)}
              className="size-4 rounded border-line"
            />
            Em promoção (de / para)
          </label>
          {onPromo ? (
            <label className="block text-sm font-medium">
              Preço promocional (para) *
              <div className="mt-1.5">
                <CurrencyInput
                  name="promoPrice"
                  required
                  defaultValue={
                    product && productHasPromo(product)
                      ? Number(product.promoPrice)
                      : 0
                  }
                />
              </div>
              <span className="mt-1 block text-xs text-ink-muted">
                Deve ser menor que o preço cheio. Aparece no catálogo e nos
                destaques da home.
              </span>
            </label>
          ) : null}
        </div>

        <label className="block text-sm font-medium">
          Categoria
          <select
            name="category"
            defaultValue={product?.category || "grau"}
            className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium">
          Formato
          <select
            name="shape"
            defaultValue={product?.shape || "outro"}
            className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5"
          >
            {shapes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium">
          Material *
          <input
            name="material"
            required
            defaultValue={product?.material}
            className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5"
          />
        </label>

        <label className="block text-sm font-medium">
          Cores (separadas por vírgula)
          <input
            name="colors"
            defaultValue={product?.colors.join(", ")}
            placeholder="Preto, Dourado"
            className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5"
          />
        </label>
      </div>

      <label className="block text-sm font-medium">
        Descrição
        <textarea
          name="description"
          rows={4}
          defaultValue={product?.description}
          className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5"
        />
      </label>

      <fieldset className="space-y-4 rounded-2xl border border-dashed border-line bg-sand/30 p-4">
        <legend className="px-1 text-sm font-medium text-brand-ink">
          Uso interno (não aparece no site)
        </legend>
        <p className="text-xs text-ink-muted">
          SKU e medidas em mm — só a equipe vê no admin. Útil para estoque e
          futuro espelho digital.
        </p>

        <label className="block text-sm font-medium">
          SKU (opcional)
          <input
            name="sku"
            defaultValue={product?.sku ?? ""}
            placeholder="Ex.: RB-2140-50"
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2.5"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm font-medium">
            Lente (mm)
            <input
              name="lensWidthMm"
              type="number"
              min={0}
              step="0.1"
              inputMode="decimal"
              defaultValue={product?.lensWidthMm ?? ""}
              placeholder="50"
              className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2.5"
            />
          </label>
          <label className="block text-sm font-medium">
            Ponte (mm)
            <input
              name="bridgeMm"
              type="number"
              min={0}
              step="0.1"
              inputMode="decimal"
              defaultValue={product?.bridgeMm ?? ""}
              placeholder="18"
              className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2.5"
            />
          </label>
          <label className="block text-sm font-medium">
            Haste (mm)
            <input
              name="templeMm"
              type="number"
              min={0}
              step="0.1"
              inputMode="decimal"
              defaultValue={product?.templeMm ?? ""}
              placeholder="140"
              className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2.5"
            />
          </label>
          <label className="block text-sm font-medium">
            Largura total (mm)
            <input
              name="frameWidthMm"
              type="number"
              min={0}
              step="0.1"
              inputMode="decimal"
              defaultValue={product?.frameWidthMm ?? ""}
              placeholder="140"
              className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2.5"
            />
          </label>
        </div>
      </fieldset>

      <ProductImagesField
        initialImages={product?.images ?? []}
        initialCrops={product?.imageCrops ?? []}
        required={isCreate}
      />

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="inStock"
            defaultChecked={product?.inStock ?? true}
            className="size-4 rounded border-line"
          />
          Em estoque
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={product?.featured ?? false}
            className="size-4 rounded border-line"
          />
          Destaque na home
        </label>
      </div>
    </ProductFormShell>
  );
}
