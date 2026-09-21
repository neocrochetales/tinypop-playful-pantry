import { createFileRoute } from "@tanstack/react-router";

import { BrowsePrompt, CategoryCards, FeaturedProduct, FinalCta, HeroSection, ProductGrid, StoreFaq, TrustStrip, WhyTinyPop } from "@/components/store/StoreSections";
import { getStorefrontData } from "@/lib/shopify";

export const Route = createFileRoute("/")({
  loader: () => getStorefrontData(),
  head: () => ({
    meta: [
      { title: "TinyPop — Fun Finds for Little Moments" },
      { name: "description", content: "Shop TinyPop for fun, useful and playful products for babies, toddlers and young children in India." },
      { property: "og:title", content: "TinyPop — Fun Finds for Little Moments" },
      { property: "og:description", content: "Discover parent-friendly TinyPop picks for everyday play, learning, bedtime and little moments at home." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const data = Route.useLoaderData();
  const products = data.products.edges.map((edge) => edge.node);

  return (
    <>
      <HeroSection products={products} />
      <TrustStrip />
      <section className="bg-background py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-sm font-black uppercase text-primary">Best sellers</p>
            <h2 className="mt-2 font-display text-3xl font-black text-foreground sm:text-4xl">Parents' Picks</h2>
          </div>
          <ProductGrid products={products.slice(0, 4)} priorityCount={4} />
        </div>
      </section>
      <CategoryCards collections={data.collections.edges} />
      <WhyTinyPop />
      <FeaturedProduct product={products[0]} />
      <BrowsePrompt products={products} />
      <StoreFaq shop={data.shop} />
      <FinalCta />
    </>
  );
}
