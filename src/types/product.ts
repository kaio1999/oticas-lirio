export type ProductCategory = "grau" | "sol" | "infantil" | "acessorio";

export type ProductShape =
  | "aviador"
  | "redondo"
  | "quadrado"
  | "gatinho"
  | "retangular"
  | "outro";

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  images: string[];
  model3dUrl?: string;
  shape: ProductShape;
  material: string;
  colors: string[];
  inStock: boolean;
  description: string;
  featured?: boolean;
};
