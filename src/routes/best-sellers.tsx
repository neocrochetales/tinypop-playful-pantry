import { createFileRoute } from "@tanstack/react-router";

import { ProductGrid } from "@/components/store/StoreSections";
import { getStorefrontData } from "@/lib/shopify";

export const Route = createFileRoute("/best-sellers")({
  loader: () => getStorefrontData(),
  head: () => ({
    meta: [
      { title: "Parents' Picks — TinyPop" },
      { name: "description", content: "Browse TinyPop's featured parent-friendly picks from the live Shopify catalogue." },
      { property: "og:title", content: "Parents' Picks — TinyPop" },
      { property: "og:description", content: "Discover highlighted TinyPop products for little moments at home." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/best-sellers" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/best-sellers" }],
  }),
  component: BestSellersPage,
});

function BestSellersPage() {
  const data = Route.useLoaderData();
  const products = data.products.edges.map((edge) => edge.node);

  return (
    <section className="bg-soft py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-black uppercase text-primary">Parents' Picks</p>
          <h1 className="mt-2 font-display text-4xl font-black text-foreground sm:text-5xl">Easy choices for playful days.</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">A focused selection from TinyPop's current Shopify products.</p>
        </div>
        <ProductGrid products={products.slice(0, 8)} priorityCount={4} />
      </div>
    </section>
  );
}
