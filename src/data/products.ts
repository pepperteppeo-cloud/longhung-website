import parsedData from './products-data.json';
import productImageMapData from './product-image-map.json';

interface RawCategory {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

interface RawProduct {
  stt: number;
  name: string;
  unit: string;
  defaultQuantity: number;
  unitPriceVnd: number;
  vatPercent: number;
  categoryId: string;
  category: string;
}

interface ProductDataFile {
  categories: RawCategory[];
  products: RawProduct[];
}

interface ProductImageMapEntry {
  stt: number;
  productName?: string;
  categoryId?: string;
  webpFile?: string;
  image?: string;
}

interface ProductImageMapFile {
  products: ProductImageMapEntry[];
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export interface Product {
  stt: number;
  slug: string;
  name: string;
  unit: string;
  defaultQuantity: number;
  unitPriceVnd: number;
  vatPercent: number;
  categoryId: string;
  category: string;
  shortCode: string;
  accentColor: string;
  image: string;
}

const data = parsedData as ProductDataFile;
const productImageMap = productImageMapData as ProductImageMapFile;

const productImageByStt = new Map<number, string>();

for (const imageEntry of productImageMap.products ?? []) {
  if (!Number.isFinite(imageEntry.stt)) {
    continue;
  }

  const rawPath = (imageEntry.webpFile ?? imageEntry.image ?? '').trim();
  if (!rawPath) {
    continue;
  }

  const normalizedPath = rawPath.replace(/^\/+/, '');
  const publicPath = normalizedPath.startsWith('products/')
    ? `/${normalizedPath}`
    : `/products/${normalizedPath}`;

  productImageByStt.set(imageEntry.stt, publicPath);
}

const categoryTheme: Record<string, { color: string; image: string }> = {
  'van-phong-pham': {
    color: '#7A3D10',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=900&h=700&fit=crop&auto=format'
  },
  'san-pham-giay': {
    color: '#174E74',
    image: 'https://images.unsplash.com/photo-1521790797524-b2497295b8a0?w=900&h=700&fit=crop&auto=format'
  },
  'bach-hoa-van-phong': {
    color: '#2B6B38',
    image: 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=900&h=700&fit=crop&auto=format'
  }
};

const fallbackTheme = {
  color: '#5B2D2F',
  image: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=900&h=700&fit=crop&auto=format'
};

function normalizeVietnamese(value: string): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

function slugify(value: string): string {
  return normalizeVietnamese(value)
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function makeShortCode(name: string): string {
  const words = name
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (!words.length) {
    return 'SP';
  }

  return words
    .map((word) => normalizeVietnamese(word).charAt(0).toUpperCase())
    .join('');
}

export const productCategories: ProductCategory[] = data.categories;

export const products: Product[] = data.products.map((product) => {
  const theme = categoryTheme[product.categoryId] ?? fallbackTheme;
  const mappedImage = productImageByStt.get(product.stt);

  return {
    ...product,
    slug: `${slugify(product.name)}-${product.stt}`,
    shortCode: makeShortCode(product.name),
    accentColor: theme.color,
    image: mappedImage ?? theme.image
  };
});

export const productBySlug = new Map(products.map((product) => [product.slug, product]));

export const priceRange = products.reduce(
  (result, product) => {
    result.min = Math.min(result.min, product.unitPriceVnd);
    result.max = Math.max(result.max, product.unitPriceVnd);
    return result;
  },
  { min: Number.POSITIVE_INFINITY, max: 0 }
);

export function getProductBySlug(slug: string): Product | undefined {
  return productBySlug.get(slug);
}

export function formatPriceVnd(value: number): string {
  return `${value.toLocaleString('vi-VN')} d`;
}

export function getRelatedProducts(currentProduct: Product, size = 4): Product[] {
  return products
    .filter((product) => product.categoryId === currentProduct.categoryId && product.slug !== currentProduct.slug)
    .slice(0, size);
}

export function normalizeText(value: string): string {
  return normalizeVietnamese(value);
}
