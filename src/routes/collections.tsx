import { Link, createFileRoute } from "@tanstack/react-router";

import { getStorefrontData, getProductImage, getValidCollections } from "@/lib/shopify";

export const Route = createFileRoute("/collections")({
  loader: () => getStorefrontData(),
  head: () => ({
    meta: [
      { title: "Categories — TinyPop" },
      { name: "description", content: "Browse TinyPop categories from the connected Shopify store, including play, learning and gift collections where available." },
      { property: "og:title", content: "Categories — TinyPop" },
      { property: "og:description", content: "Shop TinyPop products by category using the live Shopify collection structure." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/collections" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/collections" }],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  const data = Route.useLoaderData();
  const collections = getValidCollections(data.collections.edges).filter(({ node }) => node.handle !== "frontpage");

  return (
    <section className="bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-black uppercase text-primary">Categories</p>
          <h1 className="mt-2 font-display text-4xl font-black text-foreground sm:text-5xl">Browse the way parents shop.</h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">Only Shopify collections with products are shown here.</p>
        </div>
        {collections.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center shadow-card">No categories found.</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map(({ node }) => {
              const firstProduct = node.products.edges[0]?.node;
              const image = node.image ?? (firstProduct ? getProductImage(firstProduct) : null);
              return (
                <Link key={node.id} to="/collections/$handle" params={{ handle: node.handle }} className="group overflow-hidden rounded-3xl border border-border bg-card shadow-card transition hover:-translate-y-1 hover:shadow-soft">
                  {image ? <img src={image.url} alt={image.altText || node.title} className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" /> : null}
                  <div className="p-5">
                    <h2 className="font-display text-2xl font-black text-foreground">{node.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{node.description || `${node.products.edges.length} product${node.products.edges.length === 1 ? "" : "s"}`}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
