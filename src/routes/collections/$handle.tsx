import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/store/StoreSections";
import { getCollectionByHandle } from "@/lib/shopify";

export const Route = createFileRoute("/collections/$handle")({
  loader: async ({ params }) => {
    const data = await getCollectionByHandle(params.handle);
    if (!data.collection) throw notFound();
    return data;
  },
  head: ({ loaderData, params }) => {
    const collection = loaderData?.collection;
    const title = collection?.title || "Collection";
    const description = collection?.description || `Browse ${title} products at TinyPop.`;
    const image = collection?.image?.url;
    return {
      meta: [
        { title: `${title} — TinyPop` },
        { name: "description", content: description },
        { property: "og:title", content: `${title} — TinyPop` },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/collections/${params.handle}` },
        ...(image ? [{ property: "og:image", content: image }, { name: "twitter:image", content: image }] : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/collections/${params.handle}` }],
    };
  },
  errorComponent: ({ error }) => <CollectionMessage title="This category did not load" message={error.message} />,
  notFoundComponent: () => <CollectionMessage title="Category not found" message="This category may have been removed from the catalogue." />,
  component: CollectionPage,
});

function CollectionMessage({ title, message }: { title: string; message: string }) {
  return <section className="px-4 py-20 text-center"><h1 className="font-display text-4xl font-black">{title}</h1><p className="mt-3 text-muted-foreground">{message}</p><Button asChild className="mt-6 rounded-full"><Link to="/collections">All categories</Link></Button></section>;
}

function CollectionPage() {
  const { collection } = Route.useLoaderData();
  if (!collection) return null;
  const products = collection.products.edges.map((edge) => edge.node);

  return (
    <section className="bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-black uppercase text-primary">Shop by category</p>
          <h1 className="mt-2 font-display text-4xl font-black text-foreground sm:text-5xl">{collection.title}</h1>
          {collection.description ? <p className="mt-4 text-base leading-7 text-muted-foreground">{collection.description}</p> : null}
          <p className="mt-3 text-sm font-semibold text-muted-foreground">{products.length} product{products.length === 1 ? "" : "s"}</p>
        </div>
        <ProductGrid products={products} priorityCount={4} />
      </div>
    </section>
  );
}
