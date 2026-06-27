import { productCategories as localCategories, products as localProducts, formatPriceVnd, normalizeText } from './products';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export interface CatalogProduct {
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
  productLink?: string;
}

export interface ProductCatalog {
  productCategories: CatalogCategory[];
  products: CatalogProduct[];
  priceRange: { min: number; max: number };
  formatPriceVnd: typeof formatPriceVnd;
  getProductBySlug: (slug: string) => CatalogProduct | undefined;
  getRelatedProducts: (currentProduct: CatalogProduct, size?: number) => CatalogProduct[];
}

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:5000';
const API_BASE = API_URL.replace(/\/+$/, '');

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

function toPublicProductImage(rawPath?: string): string {
  if (!rawPath) {
    return '';
  }

  const normalizedPath = String(rawPath).trim().replace(/^\/+/, '');
  if (!normalizedPath) {
    return '';
  }

  return normalizedPath.startsWith('products/') ? `/${normalizedPath}` : `/products/${normalizedPath}`;
}

function resolveBackendImageUrl(rawPath?: string): string {
  if (!rawPath) {
    return '';
  }

  const normalizedPath = String(rawPath).trim();
  if (!normalizedPath) {
    return '';
  }

  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  if (normalizedPath.startsWith('/')) {
    return `${API_BASE}${normalizedPath}`;
  }

  return `${API_BASE}/${normalizedPath.replace(/^\/+/, '')}`;
}

function slugify(value: string): string {
  return normalizeText(value)
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
    .map((word) => normalizeText(word).charAt(0).toUpperCase())
    .join('');
}

function buildCatalog(
  sourceProducts: Array<{
    stt: number;
    name: string;
    unit: string;
    defaultQuantity?: number;
    unitPriceVnd: number;
    vatPercent: number;
    categoryId: string;
    category: string;
    image?: string;
    slug?: string;
    productLink?: string;
  }>,
  sourceCategories: Array<{ id: string; name: string; slug: string; productCount?: number }>
): ProductCatalog {
  const products: CatalogProduct[] = sourceProducts.map((product) => {
    const theme = categoryTheme[product.categoryId] ?? fallbackTheme;
    const productSlug = product.slug || `${slugify(product.name)}-${product.stt}`;

    return {
      stt: product.stt,
      slug: productSlug,
      name: product.name,
      unit: product.unit || 'Chiếc',
      defaultQuantity: product.defaultQuantity || 1,
      unitPriceVnd: Number(product.unitPriceVnd) || 0,
      vatPercent: Number(product.vatPercent) || 0,
      categoryId: product.categoryId,
      category: product.category,
      shortCode: makeShortCode(product.name),
      accentColor: theme.color,
      image: product.image || theme.image,
      productLink: typeof product.productLink === 'string' ? product.productLink.trim() : ''
    };
  });

  const productCategories: CatalogCategory[] = sourceCategories.map((category) => ({
    ...category,
    productCount: products.filter((product) => product.categoryId === category.id).length
  }));

  const productBySlug = new Map(products.map((product) => [product.slug, product]));

  const priceRange = products.reduce(
    (result, product) => {
      result.min = Math.min(result.min, product.unitPriceVnd);
      result.max = Math.max(result.max, product.unitPriceVnd);
      return result;
    },
    { min: Number.POSITIVE_INFINITY, max: 0 }
  );

  const getProductBySlug = (slug: string) => productBySlug.get(slug);
  const getRelatedProducts = (currentProduct: CatalogProduct, size = 4) =>
    products.filter((product) => product.categoryId === currentProduct.categoryId && product.slug !== currentProduct.slug).slice(0, size);

  return {
    productCategories,
    products,
    priceRange,
    formatPriceVnd,
    getProductBySlug,
    getRelatedProducts
  };
}

function buildBackendCatalog(rows: Array<any>): ProductCatalog {
  const sourceProducts = rows.map((row, index) => {
    const category = row.Category || row.category || {};

    return {
      stt: Number(row.id) || index + 1,
      slug: row.slug,
      name: row.name,
      unit: row.unit || 'Chiếc',
      defaultQuantity: 1,
      unitPriceVnd: Number(row.price) || 0,
      vatPercent: Number(row.vat_percent ?? row.vatPercent ?? 0) || 0,
      categoryId: category.slug || String(row.category_id || 'other'),
      category: category.name || 'Sản phẩm',
      image: resolveBackendImageUrl(row.image_url),
      productLink: row.product_link ?? row.order_url ?? row.product_url ?? row.link_url ?? row.link ?? ''
    };
  });

  const sourceCategories = Array.from(
    sourceProducts.reduce((map, product) => {
      if (!map.has(product.categoryId)) {
        map.set(product.categoryId, {
          id: product.categoryId,
          name: product.category,
          slug: product.categoryId,
          productCount: 0
        });
      }

      map.get(product.categoryId)!.productCount += 1;
      return map;
    }, new Map<string, CatalogCategory>()).values()
  );

  return buildCatalog(sourceProducts, sourceCategories);
}

export function getLocalProductCatalog(): ProductCatalog {
  return buildCatalog(localProducts as any, localCategories as any);
}

async function fetchAllBackendProducts(): Promise<Array<any>> {
  const perPage = 100;
  let page = 1;
  let totalPages = 1;
  const allRows: Array<any> = [];

  while (page <= totalPages) {
    const response = await fetch(`${API_URL}/api/products?page=${page}&limit=${perPage}&include_inactive=true`);
    if (!response.ok) {
      throw new Error(`Failed to load products page ${page}`);
    }

    const data = await response.json();
    if (!data?.success || !Array.isArray(data.data)) {
      throw new Error('Invalid products API payload');
    }

    allRows.push(...data.data);
    totalPages = Math.max(1, Number(data.pages) || 1);
    page += 1;
  }

  return allRows;
}

async function getCanonicalLocalCatalog(): Promise<ProductCatalog | null> {
  try {
    const catalogPath = path.resolve(process.cwd(), 'public', 'products', 'danh-sach-san-pham.txt');
    const imageMapPath = path.resolve(process.cwd(), 'public', 'products', 'PRODUCT_IMAGE_MAP.json');

    const [catalogRaw, imageMapRaw] = await Promise.all([
      readFile(catalogPath, 'utf8'),
      readFile(imageMapPath, 'utf8')
    ]);

    const parsedCatalog = JSON.parse(catalogRaw) as {
      products?: Array<any>;
      categories?: Array<any>;
    };

    const parsedImageMap = JSON.parse(imageMapRaw) as {
      products?: Array<any>;
    };

    if (!Array.isArray(parsedCatalog.products) || parsedCatalog.products.length === 0) {
      return null;
    }

    const imageByStt = new Map<number, string>();
    for (const entry of parsedImageMap.products || []) {
      if (Number.isFinite(entry?.stt)) {
        const image = toPublicProductImage(entry.webpFile || entry.image);
        if (image) {
          imageByStt.set(Number(entry.stt), image);
        }
      }
    }

    const sourceProducts = parsedCatalog.products.map((product) => ({
      stt: Number(product.stt),
      name: product.name,
      unit: product.unit,
      defaultQuantity: Number(product.defaultQuantity ?? 1),
      unitPriceVnd: Number(product.unitPriceVnd ?? 0),
      vatPercent: Number(product.vatPercent ?? 0),
      categoryId: product.categoryId,
      category: product.category,
      image: imageByStt.get(Number(product.stt)) || '',
      productLink: product.productLink ?? product.product_link ?? product.order_url ?? ''
    }));

    const sourceCategories = (parsedCatalog.categories || []).map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      productCount: Number(category.productCount ?? 0)
    }));

    return buildCatalog(sourceProducts, sourceCategories);
  } catch {
    return null;
  }
}

export async function loadProductCatalog(): Promise<ProductCatalog> {
  try {
    const allRows = await fetchAllBackendProducts();
    if (!allRows.length) {
      return (await getCanonicalLocalCatalog()) || getLocalProductCatalog();
    }

    return buildBackendCatalog(allRows);
  } catch {
    return (await getCanonicalLocalCatalog()) || getLocalProductCatalog();
  }
}
