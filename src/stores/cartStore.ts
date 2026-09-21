import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { type Money, type ShopifyProduct, storefrontApiRequest } from "@/lib/shopify";

export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: Money;
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  addItem: (item: Omit<CartItem, "lineId">) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  getCheckoutUrl: () => string | null;
}

const CART_QUERY = `
  query cart($id: ID!) {
    cart(id: $id) {
      id
      totalQuantity
      checkoutUrl
      lines(first: 100) {
        edges { node { id quantity merchandise { ... on ProductVariant { id } } } }
      }
    }
  }
`;

const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id checkoutUrl totalQuantity }
      userErrors { field message }
    }
  }
`;

type UserError = { field: string[] | null; message: string };

type CartLineEdge = {
  node: {
    id: string;
    quantity?: number;
    merchandise: { id: string };
  };
};

function formatCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set("channel", "online_store");
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

function isCartNotFoundError(userErrors: UserError[]): boolean {
  return userErrors.some((error) => {
    const message = error.message.toLowerCase();
    return message.includes("cart not found") || message.includes("does not exist");
  });
}

async function createShopifyCart(item: Omit<CartItem, "lineId">): Promise<{ cartId: string; checkoutUrl: string; lineId: string } | null> {
  const data = await storefrontApiRequest<{
    cartCreate: {
      cart: { id: string; checkoutUrl: string; lines: { edges: CartLineEdge[] } } | null;
      userErrors: UserError[];
    };
  }>(CART_CREATE_MUTATION, {
    input: { lines: [{ quantity: item.quantity, merchandiseId: item.variantId }] },
  });

  const userErrors = data.cartCreate.userErrors;
  if (userErrors.length > 0) {
    console.error("Cart creation failed:", userErrors);
    return null;
  }

  const cart = data.cartCreate.cart;
  const lineId = cart?.lines.edges[0]?.node.id;
  if (!cart?.checkoutUrl || !lineId) return null;

  return { cartId: cart.id, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lineId };
}

async function addLineToShopifyCart(cartId: string, item: Omit<CartItem, "lineId">): Promise<{ success: boolean; lineId?: string; checkoutUrl?: string; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest<{
    cartLinesAdd: {
      cart: { id: string; checkoutUrl: string; lines: { edges: CartLineEdge[] } } | null;
      userErrors: UserError[];
    };
  }>(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [{ quantity: item.quantity, merchandiseId: item.variantId }],
  });

  const userErrors = data.cartLinesAdd.userErrors;
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) {
    console.error("Add line failed:", userErrors);
    return { success: false };
  }

  const cart = data.cartLinesAdd.cart;
  const newLine = cart?.lines.edges.find((line) => line.node.merchandise.id === item.variantId);
  return { success: true, lineId: newLine?.node.id, checkoutUrl: cart?.checkoutUrl ? formatCheckoutUrl(cart.checkoutUrl) : undefined };
}

async function updateShopifyCartLine(cartId: string, lineId: string, quantity: number): Promise<{ success: boolean; checkoutUrl?: string; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest<{
    cartLinesUpdate: {
      cart: { id: string; checkoutUrl: string } | null;
      userErrors: UserError[];
    };
  }>(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });

  const userErrors = data.cartLinesUpdate.userErrors;
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) {
    console.error("Update line failed:", userErrors);
    return { success: false };
  }

  const checkoutUrl = data.cartLinesUpdate.cart?.checkoutUrl;
  return { success: true, checkoutUrl: checkoutUrl ? formatCheckoutUrl(checkoutUrl) : undefined };
}

async function removeLineFromShopifyCart(cartId: string, lineId: string): Promise<{ success: boolean; checkoutUrl?: string; cartNotFound?: boolean; empty?: boolean }> {
  const data = await storefrontApiRequest<{
    cartLinesRemove: {
      cart: { id: string; checkoutUrl: string; totalQuantity: number } | null;
      userErrors: UserError[];
    };
  }>(CART_LINES_REMOVE_MUTATION, { cartId, lineIds: [lineId] });

  const userErrors = data.cartLinesRemove.userErrors;
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) {
    console.error("Remove line failed:", userErrors);
    return { success: false };
  }

  const cart = data.cartLinesRemove.cart;
  return {
    success: true,
    checkoutUrl: cart?.checkoutUrl ? formatCheckoutUrl(cart.checkoutUrl) : undefined,
    empty: cart?.totalQuantity === 0,
  };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isLoading: false,
      isSyncing: false,
      addItem: async (item) => {
        const { items, cartId, clearCart } = get();
        const existingItem = items.find((storedItem) => storedItem.variantId === item.variantId);

        set({ isLoading: true });
        try {
          if (!cartId) {
            const result = await createShopifyCart(item);
            if (result) {
              set({ cartId: result.cartId, checkoutUrl: result.checkoutUrl, items: [{ ...item, lineId: result.lineId }] });
            }
          } else if (existingItem) {
            const newQuantity = existingItem.quantity + item.quantity;
            if (!existingItem.lineId) return;
            const result = await updateShopifyCartLine(cartId, existingItem.lineId, newQuantity);
            if (result.success) {
              const currentItems = get().items;
              set({
                checkoutUrl: result.checkoutUrl ?? get().checkoutUrl,
                items: currentItems.map((storedItem) => (storedItem.variantId === item.variantId ? { ...storedItem, quantity: newQuantity } : storedItem)),
              });
            } else if (result.cartNotFound) {
              clearCart();
            }
          } else {
            const result = await addLineToShopifyCart(cartId, item);
            if (result.success) {
              const currentItems = get().items;
              set({ checkoutUrl: result.checkoutUrl ?? get().checkoutUrl, items: [...currentItems, { ...item, lineId: result.lineId ?? null }] });
            } else if (result.cartNotFound) {
              clearCart();
            }
          }
        } catch (error) {
          console.error("Failed to add item:", error);
        } finally {
          set({ isLoading: false });
        }
      },
      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(variantId);
          return;
        }

        const { items, cartId, clearCart } = get();
        const item = items.find((storedItem) => storedItem.variantId === variantId);
        if (!item?.lineId || !cartId) return;

        set({ isLoading: true });
        try {
          const result = await updateShopifyCartLine(cartId, item.lineId, quantity);
          if (result.success) {
            const currentItems = get().items;
            set({
              checkoutUrl: result.checkoutUrl ?? get().checkoutUrl,
              items: currentItems.map((storedItem) => (storedItem.variantId === variantId ? { ...storedItem, quantity } : storedItem)),
            });
          } else if (result.cartNotFound) {
            clearCart();
          }
        } catch (error) {
          console.error("Failed to update quantity:", error);
        } finally {
          set({ isLoading: false });
        }
      },
      removeItem: async (variantId) => {
        const { items, cartId, clearCart } = get();
        const item = items.find((storedItem) => storedItem.variantId === variantId);
        if (!item?.lineId || !cartId) return;

        set({ isLoading: true });
        try {
          const result = await removeLineFromShopifyCart(cartId, item.lineId);
          if (result.success) {
            const currentItems = get().items;
            const newItems = currentItems.filter((storedItem) => storedItem.variantId !== variantId);
            result.empty || newItems.length === 0 ? clearCart() : set({ checkoutUrl: result.checkoutUrl ?? get().checkoutUrl, items: newItems });
          } else if (result.cartNotFound) {
            clearCart();
          }
        } catch (error) {
          console.error("Failed to remove item:", error);
        } finally {
          set({ isLoading: false });
        }
      },
      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
      getCheckoutUrl: () => get().checkoutUrl,
      syncCart: async () => {
        const { cartId, isSyncing, clearCart } = get();
        if (!cartId || isSyncing) return;

        set({ isSyncing: true });
        try {
          const data = await storefrontApiRequest<{
            cart: { id: string; totalQuantity: number; checkoutUrl: string; lines: { edges: CartLineEdge[] } } | null;
          }>(CART_QUERY, { id: cartId });
          const cart = data.cart;
          if (!cart || cart.totalQuantity === 0) {
            clearCart();
            return;
          }
          const lineIdsByVariant = new Map(cart.lines.edges.map((line) => [line.node.merchandise.id, line.node.id]));
          const currentItems = get().items;
          set({
            checkoutUrl: formatCheckoutUrl(cart.checkoutUrl),
            items: currentItems
              .filter((item) => lineIdsByVariant.has(item.variantId))
              .map((item) => ({ ...item, lineId: lineIdsByVariant.get(item.variantId) ?? item.lineId })),
          });
        } catch (error) {
          console.error("Failed to sync cart with Shopify:", error);
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: "tinypop-shopify-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, cartId: state.cartId, checkoutUrl: state.checkoutUrl }),
    },
  ),
);
