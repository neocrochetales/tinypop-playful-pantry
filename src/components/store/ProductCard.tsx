import { Link } from "@tanstack/react-router";
import { Loader2, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getFirstAvailableVariant, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { ProductImage } from "./ProductImage";
import { Price } from "./Price";

export function ProductCard({ product, priority = false }: { product: ShopifyProduct; priority?: boolean }) {
  const addItem = useCartStore((state) => state.addItem);
  const isLoading = useCartStore((state) => state.isLoading);
  const selectedVariant = getFirstAvailableVariant(product);
  const available = Boolean(selectedVariant?.availableForSale && product.availableForSale);

  const handleAddToCart = async () => {
    if (!selectedVariant || !available) return;
    await addItem({
      product,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions,
    });
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <Link to="/products/$handle" params={{ handle: product.handle }} className="block overflow-hidden bg-muted" aria-label={`View ${product.title}`}>
        <ProductImage product={product} priority={priority} className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" />
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="space-y-2">
          <Link to="/products/$handle" params={{ handle: product.handle }} className="block">
            <h3 className="line-clamp-2 min-h-12 text-base font-bold leading-snug text-foreground transition-colors hover:text-primary">{product.title}</h3>
          </Link>
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{product.description}</p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3">
          <Price price={selectedVariant?.price ?? product.priceRange.minVariantPrice} compareAtPrice={selectedVariant?.compareAtPrice} />
          <Button onClick={handleAddToCart} disabled={!available || isLoading} size="sm" className="min-h-10 shrink-0 rounded-full px-4">
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <ShoppingBag className="size-4" />}
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
