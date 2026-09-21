import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { formatMoney, getProductImage } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + Number(item.price.amount) * item.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "INR";

  useEffect(() => {
    if (isOpen) syncCart();
  }, [isOpen, syncCart]);

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank");
      setIsOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative size-11 rounded-full border-border bg-card shadow-card" aria-label="Open cart">
          <ShoppingCart className="size-5" />
          {totalItems > 0 ? (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {totalItems}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex h-full w-full flex-col overflow-hidden border-border bg-background p-0 sm:max-w-lg">
        <SheetHeader className="border-b border-border px-5 py-5 text-left">
          <SheetTitle className="font-display text-2xl">Your cart</SheetTitle>
          <SheetDescription>{totalItems === 0 ? "Your cart is empty." : `${totalItems} item${totalItems === 1 ? "" : "s"} ready for checkout.`}</SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          {items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center px-6 text-center">
              <div className="space-y-4">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <ShoppingCart className="size-7" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">No products in cart</p>
                  <p className="mt-1 text-sm text-muted-foreground">Browse TinyPop picks and add your favourites.</p>
                </div>
                <Button asChild className="rounded-full" onClick={() => setIsOpen(false)}>
                  <a href="/shop">Shop TinyPop</a>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                <div className="space-y-4">
                  {items.map((item) => {
                    const image = getProductImage(item.product);
                    return (
                      <div key={item.variantId} className="grid grid-cols-[5rem_1fr] gap-4 rounded-2xl border border-border bg-card p-3 shadow-card">
                        <div className="overflow-hidden rounded-2xl bg-muted">
                          {image ? <img src={image.url} alt={image.altText || item.product.title} className="aspect-square w-full object-cover" /> : null}
                        </div>
                        <div className="min-w-0 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="line-clamp-2 font-semibold leading-snug text-foreground">{item.product.title}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{item.selectedOptions.map((option) => option.value).join(" • ")}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={() => removeItem(item.variantId)} aria-label={`Remove ${item.product.title}`}>
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center rounded-full border border-border bg-background p-1">
                              <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={() => updateQuantity(item.variantId, item.quantity - 1)} aria-label="Decrease quantity">
                                <Minus className="size-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                              <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={() => updateQuantity(item.variantId, item.quantity + 1)} aria-label="Increase quantity">
                                <Plus className="size-3" />
                              </Button>
                            </div>
                            <p className="font-bold text-foreground">{formatMoney(item.price)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-4 border-t border-border bg-card px-5 py-5">
                <div className="flex items-center justify-between text-base">
                  <span className="font-semibold text-foreground">Subtotal</span>
                  <span className="font-black text-foreground">{formatMoney({ amount: String(totalPrice), currencyCode: currency })}</span>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">Shipping, taxes and payment options are calculated by Shopify at checkout.</p>
                <Button onClick={handleCheckout} className="h-12 w-full rounded-full text-base" disabled={items.length === 0 || isLoading || isSyncing}>
                  {isLoading || isSyncing ? <Loader2 className="size-4 animate-spin" /> : <ExternalLink className="size-4" />}
                  Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
