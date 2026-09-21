import { PackageOpen } from "lucide-react";

import { type ShopifyProduct, getProductImage } from "@/lib/shopify";

export function ProductImage({ product, className = "", sizes = "(min-width: 768px) 33vw, 90vw", priority = false }: { product: ShopifyProduct; className?: string; sizes?: string; priority?: boolean }) {
  const image = getProductImage(product);

  if (!image) {
    return (
      <div className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}>
        <PackageOpen className="size-10" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={image.url}
      alt={image.altText || product.title}
      className={className}
      loading={priority ? "eager" : "lazy"}
      sizes={sizes}
    />
  );
}
