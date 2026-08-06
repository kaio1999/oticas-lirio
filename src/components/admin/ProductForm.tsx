"use client";

import { AdminFlash } from "@/components/admin/AdminFlash";
import { CurrencyInput } from "@/components/admin/CurrencyInput";
import {
  ProductFormShell,
  ProductImagesField,
} from "@/components/admin/ProductImagesField";
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
  return (
    <ProductFormShell
      action={action}
      className="space-y-5 rounded-2xl border border-line bg-white p-6"
    >
      <AdminFlash
        message={error}
        variant="error"
        className=""
      />

      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      {!product ? (
        <label className="block text-sm font-medium">
          ID (opcional)
          <input
            name="id"
            placeholder="ex: lirio-aviador-13"
            className="mt-1.5 w-full rounded-xl border border-line px-3 py-2.5"
          />
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
          Marca
          <input
            name="brand"
            defaultValue={product?.brand || "Óticas Lírio"}
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

      <ProductImagesField initialImages={product?.images ?? []} />

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

      <button type="submit" className="btn btn-primary">
        {submitLabel}
      </button>
    </ProductFormShell>
  );
}
