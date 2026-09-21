import { Link } from "@tanstack/react-router";

export function StoreLogo() {
  return (
    <Link to="/" className="group inline-flex items-center gap-2" aria-label="TinyPop home">
      <span className="flex size-10 items-center justify-center rounded-full bg-primary text-base font-black text-primary-foreground shadow-soft transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-105">
        Tp
      </span>
      <span className="font-display text-2xl font-black text-foreground">TinyPop</span>
    </Link>
  );
}
