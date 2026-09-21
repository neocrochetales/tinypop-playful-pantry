import { Link } from "@tanstack/react-router";
import { Instagram, Mail } from "lucide-react";

import { StoreLogo } from "./StoreLogo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <StoreLogo />
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">Fun, useful and playful finds for babies, toddlers and young children.</p>
          <div className="flex gap-3 text-muted-foreground">
            <a href="mailto:hello@tinypop.in" aria-label="Email TinyPop" className="rounded-full border border-border p-3 transition hover:border-primary hover:text-primary">
              <Mail className="size-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="TinyPop Instagram" className="rounded-full border border-border p-3 transition hover:border-primary hover:text-primary">
              <Instagram className="size-4" />
            </a>
          </div>
        </div>
        <div>
          <h2 className="font-display text-lg font-black text-foreground">Shop</h2>
          <nav className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <Link to="/shop" className="hover:text-primary">All products</Link>
            <Link to="/best-sellers" className="hover:text-primary">Parents' Picks</Link>
            <Link to="/collections" className="hover:text-primary">Categories</Link>
            <a href="mailto:hello@tinypop.in" className="hover:text-primary">Contact</a>
          </nav>
        </div>
        <div>
          <h2 className="font-display text-lg font-black text-foreground">Policies</h2>
          <nav className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <Link to="/policies/shipping" className="hover:text-primary">Shipping Policy</Link>
            <Link to="/policies/returns" className="hover:text-primary">Return Policy</Link>
            <Link to="/policies/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link to="/policies/terms" className="hover:text-primary">Terms</Link>
            <Link to="/policies/refund" className="hover:text-primary">Refund Policy</Link>
          </nav>
        </div>
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground">© 2026 TinyPop. Checkout and payments are securely handled by Shopify.</div>
    </footer>
  );
}
