import type { Product, ProductCategory, ProductShape } from "@/types/product";
import type { StoreInfo } from "@/types/store";

export type ProductRow = {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  images: string[];
  model_3d_url: string | null;
  shape: ProductShape;
  material: string;
  colors: string[];
  in_stock: boolean;
  description: string;
  featured: boolean;
};

export type StoreSettingsRow = {
  id: number;
  name: string;
  legal_name: string;
  cnpj: string;
  slogan: string;
  founder: StoreInfo["founder"];
  story: string;
  value_items: StoreInfo["values"];
  differentials: string[];
  address: StoreInfo["address"];
  phone: string;
  phone_e164: string;
  email: string;
  instagram: string;
  instagram_handle: string;
  hours: StoreInfo["hours"];
  opened_at: string;
};

export function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    price: Number(row.price),
    images: row.images ?? [],
    model3dUrl: row.model_3d_url ?? undefined,
    shape: row.shape,
    material: row.material,
    colors: row.colors ?? [],
    inStock: row.in_stock,
    description: row.description,
    featured: row.featured || undefined,
  };
}

export function mapStoreRow(row: StoreSettingsRow): StoreInfo {
  return {
    name: row.name,
    legalName: row.legal_name,
    cnpj: row.cnpj,
    slogan: row.slogan,
    founder: row.founder,
    story: row.story,
    values: row.value_items,
    differentials: row.differentials,
    address: row.address,
    phone: row.phone,
    phoneE164: row.phone_e164,
    email: row.email,
    instagram: row.instagram,
    instagramHandle: row.instagram_handle,
    hours: row.hours,
    openedAt: row.opened_at,
  };
}
