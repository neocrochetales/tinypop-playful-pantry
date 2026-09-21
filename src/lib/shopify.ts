export const SHOPIFY_API_VERSION = "2025-07";
export const SHOPIFY_STORE_PERMANENT_DOMAIN = "xpvavd-ux.myshopify.com";
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
export const SHOPIFY_STOREFRONT_TOKEN = "b91492fdd245558d0eebcb016a2a88d3";

export type Money = {
  amount: string;
  currencyCode: string;
};

export type ShopifyImage = {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
};

export type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: Array<{ name: string; value: string }>;
};

export type ShopifyProduct = {
  id: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  handle: string;
  availableForSale: boolean;
  vendor: string;
  productType: string;
  tags: string[];
  seo?: { title: string | null; description: string | null };
  priceRange: { minVariantPrice: Money };
  images: { edges: Array<{ node: ShopifyImage }> };
  variants: { edges: Array<{ node: ShopifyVariant }> };
  options: Array<{ name: string; values: string[] }>;
};

export type ProductEdge = { node: ShopifyProduct };

export type ShopifyCollection = {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: ShopifyImage | null;
  products: { edges: ProductEdge[] };
};

export type ShopifyPolicy = {
  title: string;
  url: string;
  body: string;
} | null;

export type ShopifyShop = {
  name: string;
  description: string;
  privacyPolicy: ShopifyPolicy;
  refundPolicy: ShopifyPolicy;
  shippingPolicy: ShopifyPolicy;
  termsOfService: ShopifyPolicy;
};

export type StorefrontData = {
  shop: ShopifyShop;
  products: { edges: ProductEdge[] };
  collections: { edges: Array<{ node: ShopifyCollection }> };
};

export const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    title
    description
    descriptionHtml
    handle
    availableForSale
    vendor
    productType
    tags
    seo { title description }
    priceRange {
      minVariantPrice { amount currencyCode }
    }
    images(first: 10) {
      edges { node { url altText width height } }
    }
    variants(first: 20) {
      edges {
        node {
          id
          title
          availableForSale
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          selectedOptions { name value }
        }
      }
    }
    options { name values }
  }
`;

export const STOREFRONT_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetStorefront($first: Int!, $query: String) {
    shop {
      name
      description
      privacyPolicy { title url body }
      refundPolicy { title url body }
      shippingPolicy { title url body }
      termsOfService { title url body }
    }
    collections(first: 20) {
      edges {
        node {
          id
          title
          handle
          description
          image { url altText width height }
          products(first: 12) { edges { node { ...ProductFields } } }
        }
      }
    }
    products(first: $first, query: $query) {
      edges { node { ...ProductFields } }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  ${PRODUCT_FRAGMENT}
  query ProductByHandle($handle: String!) {
    product(handle: $handle) { ...ProductFields }
    shop {
      name
      privacyPolicy { title url body }
      refundPolicy { title url body }
      shippingPolicy { title url body }
      termsOfService { title url body }
    }
  }
`;

export const COLLECTION_BY_HANDLE_QUERY = `
  ${PRODUCT_FRAGMENT}
  query CollectionByHandle($handle: String!) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      image { url altText width height }
      products(first: 48) { edges { node { ...ProductFields } } }
    }
  }
`;

export const POLICIES_QUERY = `
  query Policies {
    shop {
      name
      privacyPolicy { title url body }
      refundPolicy { title url body }
      shippingPolicy { title url body }
      termsOfService { title url body }
    }
  }
`;

export async function storefrontApiRequest<T>(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 402) {
    throw new Error("Shopify API access requires an active Shopify billing plan.");
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Shopify request failed [${response.status}]: ${errorBody}`);
  }

  const data = (await response.json()) as { data?: T; errors?: Array<{ message: string }> };
  if (data.errors?.length) {
    throw new Error(`Shopify returned an error: ${data.errors.map((error) => error.message).join(", ")}`);
  }

  return data.data as T;
}

export async function getStorefrontData(query?: string): Promise<StorefrontData> {
  return storefrontApiRequest<StorefrontData>(STOREFRONT_QUERY, { first: 24, query });
}

export async function getProductByHandle(handle: string): Promise<{ product: ShopifyProduct | null; shop: ShopifyShop }> {
  return storefrontApiRequest<{ product: ShopifyProduct | null; shop: ShopifyShop }>(PRODUCT_BY_HANDLE_QUERY, { handle });
}

export async function getCollectionByHandle(handle: string): Promise<{ collection: ShopifyCollection | null }> {
  return storefrontApiRequest<{ collection: ShopifyCollection | null }>(COLLECTION_BY_HANDLE_QUERY, { handle });
}

export async function getPolicies(): Promise<{ shop: ShopifyShop }> {
  return storefrontApiRequest<{ shop: ShopifyShop }>(POLICIES_QUERY);
}

export function getProductImage(product: ShopifyProduct) {
  return product.images.edges[0]?.node ?? null;
}

export function getFirstAvailableVariant(product: ShopifyProduct) {
  return product.variants.edges.find((edge) => edge.node.availableForSale)?.node ?? product.variants.edges[0]?.node ?? null;
}

export function formatMoney(money?: Money | null) {
  if (!money) return "";
  const amount = Number(money.amount);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: money.currencyCode,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function isRealCompareAtPrice(price?: Money | null, compareAtPrice?: Money | null) {
  if (!price || !compareAtPrice) return false;
  return Number(compareAtPrice.amount) > Number(price.amount);
}

export function getValidCollections(collections: Array<{ node: ShopifyCollection }>) {
  return collections.filter(({ node }) => node.products.edges.length > 0);
}

export function stripHtml(html?: string | null) {
  return (html ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
