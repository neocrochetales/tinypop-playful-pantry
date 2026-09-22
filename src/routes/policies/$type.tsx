import { Link, createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { getPolicies, stripHtml, type ShopifyPolicy } from "@/lib/shopify";

const labels: Record<string, string> = {
  shipping: "Shipping Policy",
  returns: "Return Policy",
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  refund: "Refund Policy",
};

export const Route = createFileRoute("/policies/$type")({
  loader: ({ params }) => getPolicies().then((data) => ({ ...data, type: params.type })),
  head: ({ params }) => {
    const label = labels[params.type] ?? "Store Policy";
    const description = `Read the current ${label.toLowerCase()} information for shopping with TinyPop.`;
    return {
      meta: [
        { title: `${label} — TinyPop` },
        { name: "description", content: description },
        { property: "og:title", content: `${label} — TinyPop` },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/policies/${params.type}` },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: `/policies/${params.type}` }],
    };
  },
  errorComponent: ({ error }) => <PolicyMessage title="Policy unavailable" message={error.message} />,
  notFoundComponent: () => <PolicyMessage title="Policy not found" message="The requested policy page does not exist." />,
  component: PolicyPage,
});

function resolvePolicy(type: string, shop: Awaited<ReturnType<typeof getPolicies>>["shop"]): ShopifyPolicy {
  if (type === "privacy") return shop.privacyPolicy;
  if (type === "terms") return shop.termsOfService;
  if (type === "shipping") return shop.shippingPolicy;
  if (type === "refund" || type === "returns") return shop.refundPolicy;
  return null;
}

function PolicyMessage({ title, message }: { title: string; message: string }) {
  return <section className="px-4 py-20 text-center"><h1 className="font-display text-4xl font-black">{title}</h1><p className="mx-auto mt-3 max-w-lg text-muted-foreground">{message}</p><Button asChild className="mt-6 rounded-full"><Link to="/">Back to TinyPop</Link></Button></section>;
}

function PolicyPage() {
  const { shop, type } = Route.useLoaderData();
  const label = labels[type] ?? "Store Policy";
  const policy = resolvePolicy(type, shop);

  return (
    <section className="bg-soft py-10 sm:py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-black uppercase text-primary">TinyPop policies</p>
        <h1 className="mt-2 font-display text-4xl font-black text-foreground sm:text-5xl">{label}</h1>
        <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-9">
          {policy?.body ? (
            <div className="whitespace-pre-line text-sm leading-7 text-muted-foreground">{stripHtml(policy.body)}</div>
          ) : (
            <div className="space-y-4 text-sm leading-7 text-muted-foreground">
              <p>TinyPop has not published this policy in Shopify yet, so no terms have been invented here.</p>
              <p>Relevant shipping, tax and payment details are shown at checkout where available. For policy questions before ordering, contact <a className="font-bold text-primary hover:underline" href="mailto:hello@tinypop.in">hello@tinypop.in</a>.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
