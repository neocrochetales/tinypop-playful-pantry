import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatMoney, getFirstAvailableVariant, getProductImage, getStorefrontData, type ShopifyProduct } from "@/lib/shopify";

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const trimmedQuery = query.trim();

  const filteredProducts = useMemo(() => {
    if (!trimmedQuery) return products.slice(0, 6);
    const normalizedQuery = trimmedQuery.toLowerCase();
    return products.filter((product) => {
      return [product.title, product.description, product.productType, product.vendor, product.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [products, trimmedQuery]);

  const loadProducts = async () => {
    if (products.length > 0 || loading) return;
    setLoading(true);
    try {
      const data = await getStorefrontData();
      setProducts(data.products.edges.map((edge) => edge.node));
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="size-11 rounded-full border-border bg-card shadow-card" onClick={loadProducts} aria-label="Search products">
          <Search className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="top-6 max-h-[88vh] translate-y-0 overflow-hidden rounded-3xl border-border bg-background p-0 shadow-soft sm:max-w-2xl">
        <DialogHeader className="border-b border-border px-5 py-5 text-left">
          <DialogTitle className="font-display text-2xl">Search TinyPop</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-5">
          <label className="sr-only" htmlFor="product-search">Search products</label>
          <Input
            id="product-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search toys, books, essentials..."
            className="h-12 rounded-full bg-card px-5 text-base"
            autoComplete="off"
          />
          <div className="max-h-[58vh] overflow-y-auto pr-1">
            {loading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading products...</p>
            ) : filteredProducts.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No products found.</p>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((product) => {
                  const image = getProductImage(product);
                  const variant = getFirstAvailableVariant(product);
                  return (
                    <Link
                      key={product.id}
                      to="/products/$handle"
                      params={{ handle: product.handle }}
                      onClick={() => setOpen(false)}
                      className="grid grid-cols-[4.5rem_1fr] gap-4 rounded-2xl border border-border bg-card p-3 transition hover:border-primary/40 hover:shadow-card"
                    >
                      <div className="overflow-hidden rounded-2xl bg-muted">
                        {image ? <img src={image.url} alt={image.altText || product.title} className="aspect-square w-full object-cover" loading="lazy" /> : null}
                      </div>
                      <div className="min-w-0 self-center">
                        <p className="line-clamp-2 font-semibold text-foreground">{product.title}</p>
                        <p className="mt-1 text-sm font-bold text-primary">{formatMoney(variant?.price ?? product.priceRange.minVariantPrice)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
