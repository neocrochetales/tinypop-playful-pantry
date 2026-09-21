import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CartDrawer } from "./CartDrawer";
import { SearchDialog } from "./SearchDialog";
import { StoreLogo } from "./StoreLogo";

const navItems = [
  { label: "Shop", to: "/shop" },
  { label: "Best Sellers", to: "/best-sellers" },
  { label: "Categories", to: "/collections" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground">Fun finds for little moments ✨</div>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="size-11 rounded-full border-border bg-card shadow-card" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 border-border bg-background">
              <SheetHeader className="text-left">
                <SheetTitle>
                  <StoreLogo />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 grid gap-3">
                {navItems.map((item) => (
                  <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="rounded-2xl px-4 py-4 text-lg font-bold text-foreground transition hover:bg-muted">
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        <StoreLogo />
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} activeProps={{ className: "text-primary" }} className="text-sm font-bold text-foreground/80 transition hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <SearchDialog />
          <CartDrawer />
        </div>
      </div>
    </header>
  );
}
