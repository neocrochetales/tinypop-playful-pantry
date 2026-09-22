import { createFileRoute, notFound } from "@tanstack/react-router";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";

const pages = {
  contact: {
    title: "Contact TinyPop",
    description: "Get in touch with TinyPop about a product or order.",
  },
  about: {
    title: "About TinyPop",
    description: "TinyPop brings together fun, useful and playful finds for babies, toddlers and young children.",
  },
} as const;

type PageHandle = keyof typeof pages;

export const Route = createFileRoute("/pages/$handle")({
  loader: ({ params }) => {
    if (!(params.handle in pages)) throw notFound();
    return { handle: params.handle as PageHandle, page: pages[params.handle as PageHandle] };
  },
  head: ({ loaderData, params }) => {
    const page = loaderData?.page;
    const title = page?.title ?? "TinyPop";
    const description = page?.description ?? "Learn more about TinyPop.";
    return {
      meta: [
        { title: `${title} — TinyPop` },
        { name: "description", content: description },
        { property: "og:title", content: `${title} — TinyPop` },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/pages/${params.handle}` },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: `/pages/${params.handle}` }],
    };
  },
  errorComponent: ({ error }) => <div className="px-4 py-20 text-center text-muted-foreground">{error.message}</div>,
  notFoundComponent: () => <div className="px-4 py-20 text-center text-muted-foreground">This page was not found.</div>,
  component: StaticPage,
});

function StaticPage() {
  const { handle, page } = Route.useLoaderData();
  return (
    <section className="bg-soft py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-7 shadow-card sm:p-10">
          <p className="text-sm font-black uppercase text-primary">TinyPop</p>
          <h1 className="mt-2 font-display text-4xl font-black text-foreground sm:text-5xl">{page.title}</h1>
          <p className="mt-5 text-base leading-8 text-muted-foreground">{page.description}</p>
          {handle === "contact" ? <Button asChild className="mt-7 h-12 rounded-full px-6"><a href="mailto:hello@tinypop.in"><Mail className="size-4" />Email TinyPop</a></Button> : null}
        </div>
      </div>
    </section>
  );
}
