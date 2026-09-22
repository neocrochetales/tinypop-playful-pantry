import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { Check, ChevronRight, Loader2, Minus, Plus, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useMemo, useState } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/store/Price";
import { getProductByHandle, stripHtml, type ShopifyVariant } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";

export const Route = createFileRoute("/products/$handle")({
  loader: async ({ params }) => {
    const data = await getProductByHandle(params.handle);
    if (!data.product) throw notFound();
    return data;
  },
  head: ({ loaderData, params }) => {
    const product = loaderData?.product;
    const title = product?.seo?.title || product?.title || "Product";
    const description = product?.seo?.description || product?.description || "View product details from TinyPop.";
    const image = product?.images.edges[0]?.node.url;
    return {
      meta: [
        { title: `${title} — TinyPop` },
        { name: "description", content: description },
        { property: "og:title", content: `${title} — TinyPop` },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/products/${params.handle}` },
        ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/products/${params.handle}` }],
    };
  },
  errorComponent: ({ error }) => <RouteMessage title="This product did not load" message={error.message} />,
  notFoundComponent: () => <RouteMessage title="Product not found" message="This product may have been removed or is no longer available." />,
  component: ProductPage,
});

function RouteMessage({ title, message }: { title: string; message: string }) {
  return (
    <section className="bg-background px-4 py-20 text-center">
      <h1 className="font-display text-4xl font-black text-foreground">{title}</h1>
      <p className="mx-auto mt-4 max-w-lg text-muted-foreground">{message}</p>
      <Button asChild className="mt-7 rounded-full"><Link to="/shop">Browse all products</Link></Button>
    </section>
  );
}

function ProductPage() {
  const { product, shop } = Route.useLoaderData();
  const variants = product.variants.edges.map((edge) => edge.node);
  const firstAvailable = variants.find((variant) => variant.availableForSale) ?? variants[0];
  const [variantId, setVariantId] = useState(firstAvailable?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const addItem = useCartStore((state) => state.addItem);
  const getCheckoutUrl = useCartStore((state) => state.getCheckoutUrl);
  const isLoading = useCartStore((state) => state.isLoading);
  const variant = variants.find((item) => item.id === variantId) ?? firstAvailable;
  const images = product.images.edges.map((edge) => edge.node);
  const canBuy = Boolean(product.availableForSale && variant?.availableForSale);

  const policyText = useMemo(() => ({
    shipping: shop.shippingPolicy ? stripHtml(shop.shippingPolicy.body) : "Shipping options, charges and delivery details are confirmed at checkout.",
    returns: shop.refundPolicy ? stripHtml(shop.refundPolicy.body) : "Return and refund terms are not currently published. Contact TinyPop before ordering if you need policy details.",
  }), [shop]);

  const addToCart = async (checkout = false) => {
    if (!variant || !canBuy) return;
    await addItem({ product, variantId: variant.id, variantTitle: variant.title, price: variant.price, quantity, selectedOptions: variant.selectedOptions });
    if (checkout) {
      const url = getCheckoutUrl();
      if (url) window.open(url, "_blank");
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: images.map((image) => image.url),
    brand: { "@type": "Brand", name: "TinyPop" },
    offers: variant ? {
      "@type": "Offer",
      priceCurrency: variant.price.currencyCode,
      price: variant.price.amount,
      availability: canBuy ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `/products/${product.handle}`,
    } : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="bg-background pb-12 pt-5 sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-5 flex items-center gap-1 text-xs font-semibold text-muted-foreground" aria-label="Breadcrumb">
            <Link to="/shop" className="hover:text-primary">Shop</Link><ChevronRight className="size-3" /><span className="line-clamp-1">{product.title}</span>
          </nav>
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
            <div>
              <div className="overflow-hidden rounded-3xl bg-muted">
                {images[activeImage] ? <img src={images[activeImage].url} alt={images[activeImage].altText || product.title} className="aspect-square w-full object-cover" /> : <div className="aspect-square" />}
              </div>
              {images.length > 1 ? (
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {images.slice(0, 5).map((image, index) => (
                    <button key={image.url} type="button" onClick={() => setActiveImage(index)} aria-label={`View image ${index + 1}`} className={`overflow-hidden rounded-2xl border-2 bg-muted transition ${activeImage === index ? "border-primary" : "border-transparent"}`}>
                      <img src={image.url} alt={image.altText || `${product.title} image ${index + 1}`} className="aspect-square w-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="lg:sticky lg:top-32 lg:self-start">
              <p className="text-sm font-black uppercase text-primary">TinyPop find</p>
              <h1 className="mt-2 font-display text-4xl font-black leading-tight text-foreground sm:text-5xl">{product.title}</h1>
              <Price price={variant?.price ?? product.priceRange.minVariantPrice} compareAtPrice={variant?.compareAtPrice} className="mt-5 text-2xl" />
              <p className="mt-5 text-base leading-7 text-muted-foreground">{product.description}</p>

              {variants.length > 1 ? (
                <fieldset className="mt-7">
                  <legend className="mb-3 text-sm font-bold text-foreground">Choose an option</legend>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((item) => (
                      <Button key={item.id} type="button" variant={item.id === variant?.id ? "default" : "outline"} disabled={!item.availableForSale} onClick={() => setVariantId(item.id)} className="min-h-11 rounded-full">
                        {item.title}
                      </Button>
                    ))}
                  </div>
                </fieldset>
              ) : null}

              <div className="mt-7 flex items-center justify-between gap-4 border-y border-border py-5">
                <span className="text-sm font-bold text-foreground">Quantity</span>
                <div className="flex items-center rounded-full border border-border bg-card p-1">
                  <Button variant="ghost" size="icon" className="size-10 rounded-full" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity"><Minus className="size-4" /></Button>
                  <span className="w-10 text-center font-bold">{quantity}</span>
                  <Button variant="ghost" size="icon" className="size-10 rounded-full" onClick={() => setQuantity((value) => value + 1)} aria-label="Increase quantity"><Plus className="size-4" /></Button>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Button className="h-13 rounded-full text-base" disabled={!canBuy || isLoading} onClick={() => addToCart(false)}>{isLoading ? <Loader2 className="size-4 animate-spin" /> : <ShoppingBag className="size-4" />} {canBuy ? "Add to Cart" : "Unavailable"}</Button>
                <Button variant="outline" className="h-13 rounded-full border-primary bg-card text-base text-primary" disabled={!canBuy || isLoading} onClick={() => addToCart(true)}>Buy Now</Button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="flex gap-3 rounded-2xl bg-muted p-4"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" /><div><p className="text-sm font-bold">Secure checkout</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Payment is handled by Shopify.</p></div></div>
                <div className="flex gap-3 rounded-2xl bg-muted p-4"><Truck className="mt-0.5 size-5 shrink-0 text-primary" /><div><p className="text-sm font-bold">Shipping details</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Confirmed before payment.</p></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-soft py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-black uppercase text-primary">Good to know</p>
          <h2 className="mt-2 font-display text-3xl font-black text-foreground">Product details</h2>
          <Accordion type="multiple" defaultValue={["overview"]} className="mt-6 rounded-3xl border border-border bg-card px-5 shadow-card">
            <AccordionItem value="overview"><AccordionTrigger className="text-base font-bold hover:no-underline">Product Overview</AccordionTrigger><AccordionContent className="whitespace-pre-line text-sm leading-7 text-muted-foreground">{product.description}</AccordionContent></AccordionItem>
            <AccordionItem value="features"><AccordionTrigger className="text-base font-bold hover:no-underline">Key Features</AccordionTrigger><AccordionContent className="text-sm leading-7 text-muted-foreground">The available product details are shown in the overview above. TinyPop does not add unsupported product claims.</AccordionContent></AccordionItem>
            <AccordionItem value="included"><AccordionTrigger className="text-base font-bold hover:no-underline">What's Included</AccordionTrigger><AccordionContent className="text-sm leading-7 text-muted-foreground">Package contents have not been provided in the Shopify product information. Contact TinyPop if you need confirmation before ordering.</AccordionContent></AccordionItem>
            <AccordionItem value="use"><AccordionTrigger className="text-base font-bold hover:no-underline">How To Use</AccordionTrigger><AccordionContent className="text-sm leading-7 text-muted-foreground">Usage instructions have not been provided in the Shopify product information. Follow the packaging instructions supplied with the product.</AccordionContent></AccordionItem>
            <AccordionItem value="shipping"><AccordionTrigger className="text-base font-bold hover:no-underline">Shipping Information</AccordionTrigger><AccordionContent className="text-sm leading-7 text-muted-foreground">{policyText.shipping}</AccordionContent></AccordionItem>
            <AccordionItem value="returns"><AccordionTrigger className="text-base font-bold hover:no-underline">Returns</AccordionTrigger><AccordionContent className="text-sm leading-7 text-muted-foreground">{policyText.returns}</AccordionContent></AccordionItem>
            <AccordionItem value="faq"><AccordionTrigger className="text-base font-bold hover:no-underline">FAQ</AccordionTrigger><AccordionContent className="space-y-3 text-sm leading-7 text-muted-foreground"><p><strong className="text-foreground">Is this product available?</strong><br />The purchase button reflects the current Shopify availability.</p><p><strong className="text-foreground">Where do I see payment options?</strong><br />Available methods appear at secure Shopify checkout.</p></AccordionContent></AccordionItem>
          </Accordion>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 p-3 shadow-soft backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1"><p className="line-clamp-1 text-xs font-semibold text-muted-foreground">{product.title}</p><Price price={variant?.price} compareAtPrice={variant?.compareAtPrice} /></div>
          <Button className="h-12 rounded-full px-6" disabled={!canBuy || isLoading} onClick={() => addToCart(false)}>{isLoading ? <Loader2 className="size-4 animate-spin" /> : <ShoppingBag className="size-4" />} Add to Cart</Button>
        </div>
      </div>
    </>
  );
}
