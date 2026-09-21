import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Headphones, LockKeyhole, PackageCheck, Search, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney, getFirstAvailableVariant, getProductImage, getValidCollections, stripHtml, type ShopifyCollection, type ShopifyProduct, type ShopifyShop } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { Price } from "./Price";
import { ProductCard } from "./ProductCard";
import { ProductImage } from "./ProductImage";

export function TrustStrip() {
  const items = [
    { icon: LockKeyhole, label: "Secure Checkout" },
    { icon: ShoppingBag, label: "Easy Ordering" },
    { icon: PackageCheck, label: "Quality Products" },
    { icon: Headphones, label: "Customer Support" },
  ];

  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-5 sm:px-6 lg:grid-cols-4 lg:px-8">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-center gap-2 rounded-full bg-muted px-3 py-3 text-sm font-bold text-foreground">
            <item.icon className="size-4 text-primary" />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function EmptyProducts() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center shadow-card">
      <p className="font-display text-2xl font-black text-foreground">No products found</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Tell me what product you want to add and its price, and I can create it in Shopify.</p>
    </div>
  );
}

export function ProductGrid({ products, priorityCount = 0 }: { products: ShopifyProduct[]; priorityCount?: number }) {
  if (products.length === 0) return <EmptyProducts />;

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {products.map((product, index) => <ProductCard key={product.id} product={product} priority={index < priorityCount} />)}
    </div>
  );
}

export function HeroSection({ products }: { products: ShopifyProduct[] }) {
  const heroProduct = products[0];
  const secondProduct = products[1] ?? products[0];
  const thirdProduct = products[2] ?? products[0];

  return (
    <section className="relative overflow-hidden bg-hero">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-10 pt-8 sm:px-6 md:grid-cols-[1fr_0.95fr] md:items-center md:pb-14 md:pt-12 lg:px-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="inline-flex rounded-full bg-accent px-4 py-2 text-xs font-black uppercase text-accent-foreground">TinyPop for everyday little moments</p>
          <h1 className="mt-5 font-display text-5xl font-black leading-none text-foreground sm:text-6xl lg:text-7xl">Little Things. Big Smiles.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">Discover fun, useful and playful finds made for little moments at home.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full px-7 text-base">
              <Link to="/best-sellers">Shop Best Sellers</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-full border-border bg-card px-7 text-base shadow-card">
              <Link to="/shop">Explore All Products</Link>
            </Button>
          </div>
        </div>
        <div className="relative min-h-[330px] animate-in fade-in slide-in-from-bottom-6 duration-700 md:min-h-[520px]">
          {heroProduct ? (
            <Link to="/products/$handle" params={{ handle: heroProduct.handle }} className="absolute left-0 top-4 block w-[72%] overflow-hidden rounded-[2rem] border border-border bg-card p-3 shadow-soft transition hover:-translate-y-1">
              <ProductImage product={heroProduct} priority className="aspect-square w-full rounded-[1.45rem] object-cover" />
              <div className="px-2 py-3">
                <p className="line-clamp-1 font-bold text-foreground">{heroProduct.title}</p>
                <p className="text-sm font-bold text-primary">{formatMoney(getFirstAvailableVariant(heroProduct)?.price ?? heroProduct.priceRange.minVariantPrice)}</p>
              </div>
            </Link>
          ) : null}
          {secondProduct ? (
            <Link to="/products/$handle" params={{ handle: secondProduct.handle }} className="absolute right-0 top-0 block w-[44%] overflow-hidden rounded-[1.75rem] border border-border bg-card p-2 shadow-card transition hover:-translate-y-1">
              <ProductImage product={secondProduct} priority className="aspect-square w-full rounded-[1.2rem] object-cover" />
            </Link>
          ) : null}
          {thirdProduct ? (
            <Link to="/products/$handle" params={{ handle: thirdProduct.handle }} className="absolute bottom-2 right-4 block w-[52%] overflow-hidden rounded-[1.75rem] border border-border bg-card p-2 shadow-card transition hover:-translate-y-1">
              <ProductImage product={thirdProduct} priority className="aspect-square w-full rounded-[1.2rem] object-cover" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function CategoryCards({ collections }: { collections: Array<{ node: ShopifyCollection }> }) {
  const validCollections = getValidCollections(collections).filter(({ node }) => node.handle !== "frontpage");
  if (validCollections.length === 0) return null;

  return (
    <section className="bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase text-primary">Browse by mood</p>
            <h2 className="mt-2 font-display text-3xl font-black text-foreground sm:text-4xl">Shop by category</h2>
          </div>
          <Button asChild variant="ghost" className="hidden rounded-full sm:inline-flex">
            <Link to="/collections">View all <ArrowRight className="size-4" /></Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {validCollections.map(({ node }, index) => {
            const firstProduct = node.products.edges[0]?.node;
            const image = node.image ?? (firstProduct ? getProductImage(firstProduct) : null);
            const accentClass = ["bg-accent", "bg-secondary", "bg-muted"][index % 3] ?? "bg-muted";
            return (
              <Link key={node.id} to="/collections/$handle" params={{ handle: node.handle }} className={`group overflow-hidden rounded-3xl border border-border ${accentClass} p-4 shadow-card transition hover:-translate-y-1 hover:shadow-soft`}>
                <div className="grid grid-cols-[1fr_6.5rem] items-center gap-4">
                  <div>
                    <h3 className="font-display text-2xl font-black text-foreground">{node.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{node.description || `${node.products.edges.length} TinyPop pick${node.products.edges.length === 1 ? "" : "s"}`}</p>
                  </div>
                  <div className="overflow-hidden rounded-2xl bg-card shadow-card">
                    {image ? <img src={image.url} alt={image.altText || node.title} loading="lazy" className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" /> : null}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function WhyTinyPop() {
  const benefits = [
    "Thoughtfully selected",
    "Easy ordering",
    "Made for everyday fun",
    "Secure checkout",
  ];

  return (
    <section className="bg-soft py-12 sm:py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-black uppercase text-primary">Why TinyPop</p>
          <h2 className="mt-2 font-display text-4xl font-black text-foreground">Made for little moments.</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">A warm place to discover playful, useful products for children without clutter, pressure, or guesswork.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-center gap-3 rounded-3xl border border-border bg-card p-5 shadow-card">
              <CheckCircle2 className="size-5 text-primary" />
              <span className="font-bold text-foreground">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedProduct({ product }: { product?: ShopifyProduct }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const getCheckoutUrl = useCartStore((state) => state.getCheckoutUrl);
  const isLoading = useCartStore((state) => state.isLoading);
  const selectedVariant = product ? getFirstAvailableVariant(product) : null;

  if (!product || !selectedVariant) return null;

  const handleAdd = async (checkout = false) => {
    await addItem({
      product,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
      selectedOptions: selectedVariant.selectedOptions,
    });
    if (checkout) {
      const checkoutUrl = getCheckoutUrl();
      if (checkoutUrl) window.open(checkoutUrl, "_blank");
    }
  };

  return (
    <section className="bg-background py-12 sm:py-16">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft lg:grid-cols-2">
        <ProductImage product={product} className="aspect-square h-full w-full object-cover" />
        <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
          <p className="text-sm font-black uppercase text-primary">Featured product</p>
          <h2 className="mt-3 font-display text-3xl font-black leading-tight text-foreground sm:text-4xl">{product.title}</h2>
          <Price price={selectedVariant.price} compareAtPrice={selectedVariant.compareAtPrice} className="mt-4 text-xl" />
          <p className="mt-4 line-clamp-4 text-base leading-7 text-muted-foreground">{product.description}</p>
          {product.options.some((option) => option.values.length > 1) ? (
            <div className="mt-6 space-y-2">
              <p className="text-sm font-bold text-foreground">Options</p>
              <div className="flex flex-wrap gap-2">
                {selectedVariant.selectedOptions.map((option) => (
                  <span key={`${option.name}-${option.value}`} className="rounded-full border border-border bg-muted px-4 py-2 text-sm font-semibold text-foreground">{option.value}</span>
                ))}
              </div>
            </div>
          ) : null}
          <div className="mt-6 flex items-center gap-3">
            <span className="text-sm font-bold text-foreground">Quantity</span>
            <div className="flex items-center rounded-full border border-border bg-background p-1">
              <Button variant="ghost" size="icon" className="size-9 rounded-full" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>-</Button>
              <span className="w-9 text-center font-bold">{quantity}</span>
              <Button variant="ghost" size="icon" className="size-9 rounded-full" onClick={() => setQuantity((value) => value + 1)}>+</Button>
            </div>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Button className="h-12 rounded-full text-base" disabled={!selectedVariant.availableForSale || isLoading} onClick={() => handleAdd(false)}>Add to Cart</Button>
            <Button variant="outline" className="h-12 rounded-full border-border bg-background text-base" disabled={!selectedVariant.availableForSale || isLoading} onClick={() => handleAdd(true)}>Buy Now</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BrowsePrompt({ products }: { products: ShopifyProduct[] }) {
  return (
    <section className="bg-soft py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase text-primary">Keep browsing</p>
            <h2 className="mt-2 font-display text-3xl font-black text-foreground sm:text-4xl">Something fun is waiting 👀</h2>
          </div>
          <Button asChild variant="ghost" className="hidden rounded-full sm:inline-flex">
            <Link to="/shop">All products <ArrowRight className="size-4" /></Link>
          </Button>
        </div>
        <ProductGrid products={products.slice(1, 5)} />
      </div>
    </section>
  );
}

export function StoreFaq({ shop }: { shop?: ShopifyShop }) {
  const shippingAnswer = shop?.shippingPolicy
    ? stripHtml(shop.shippingPolicy.body).slice(0, 260)
    : "Shipping details are confirmed during checkout. TinyPop will show available delivery options before payment.";
  const returnsAnswer = shop?.refundPolicy
    ? stripHtml(shop.refundPolicy.body).slice(0, 260)
    : "Return and refund details are not published yet. Please contact TinyPop before ordering if you need policy information.";

  const faqs = [
    { question: "How long does shipping take?", answer: shippingAnswer },
    { question: "How can I track my order?", answer: "Order tracking details are shared after your order is placed, wherever tracking is available for the shipment." },
    { question: "What payment methods are available?", answer: "Available payment methods are shown securely at Shopify checkout before you complete payment." },
    { question: "What is your return/refund policy?", answer: returnsAnswer },
    { question: "How can I contact TinyPop?", answer: "You can reach TinyPop at hello@tinypop.in for order or product questions." },
  ];

  return (
    <section className="bg-background py-12 sm:py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <p className="text-sm font-black uppercase text-primary">Questions</p>
          <h2 className="mt-2 font-display text-3xl font-black text-foreground sm:text-4xl">Helpful answers before checkout.</h2>
        </div>
        <Accordion type="single" collapsible className="rounded-3xl border border-border bg-card px-5 shadow-card">
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger className="text-base font-bold hover:no-underline">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-sm leading-6 text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="bg-hero px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <Sparkles className="mx-auto size-8 text-primary" />
        <h2 className="mt-4 font-display text-4xl font-black text-foreground sm:text-5xl">Make their next little moment a fun one.</h2>
        <Button asChild size="lg" className="mt-7 h-12 rounded-full px-8 text-base">
          <Link to="/shop">Shop TinyPop</Link>
        </Button>
      </div>
    </section>
  );
}

export function ShopFilter({ products }: { products: ShopifyProduct[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return products;
    return products.filter((product) => [product.title, product.description, product.productType, product.vendor, product.tags.join(" ")].join(" ").toLowerCase().includes(value));
  }, [products, query]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3 rounded-full border border-border bg-background px-4">
          <Search className="size-5 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search TinyPop products" className="h-12 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" />
        </div>
        <p className="text-sm font-semibold text-muted-foreground">{filtered.length} product{filtered.length === 1 ? "" : "s"}</p>
      </div>
      <ProductGrid products={filtered} priorityCount={4} />
    </div>
  );
}
