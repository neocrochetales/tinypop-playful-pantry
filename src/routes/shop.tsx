import { createFileRoute } from "@tanstack/react-router";

import { ShopFilter } from "@/components/store/StoreSections";
import { getStorefrontData } from "@/lib/shopify";

export const Route = createFileRoute("/shop")({
  loader: () => getStorefrontData(),
  head: () => ({
    meta: [
      { title: "Shop All Products — TinyPop" },
      { name: "description", content: "Browse all TinyPop products for babies, toddlers and young children, using real products from the connected Shopify store." },
      { property: "og:title", content: "Shop All Products — TinyPop" },
      { property: "og:description", content: "Find playful, useful and parent-friendly TinyPop products in one easy-to-browse shop." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/shop" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: ShopPage,
});

function ShopPage() {
  const data = Route.useLoaderData();
  const products = data.products.edges.map((edge) => edge.node);

  return (
    <section className="bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-black uppercase text-primary">Shop TinyPop</p>
          <h1 className="mt-2 font-display text-4xl font-black text-foreground sm:text-5xl">Fun finds for everyday play.</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">Explore the full TinyPop catalogue pulled directly from Shopify.</p>
        </div>
        <ShopFilter products={products} />
      </div>
    </section>
  );
}
