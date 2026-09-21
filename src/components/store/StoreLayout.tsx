import { Outlet } from "@tanstack/react-router";

import { useCartSync } from "@/hooks/useCartSync";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function StoreLayout() {
  useCartSync();

  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
