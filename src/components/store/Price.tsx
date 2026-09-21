import { formatMoney, isRealCompareAtPrice, type Money } from "@/lib/shopify";

export function Price({ price, compareAtPrice, className = "" }: { price?: Money | null; compareAtPrice?: Money | null; className?: string }) {
  const hasCompareAt = isRealCompareAtPrice(price, compareAtPrice);
  return (
    <div className={`flex flex-wrap items-baseline gap-2 ${className}`}>
      <span className="font-bold text-foreground">{formatMoney(price)}</span>
      {hasCompareAt ? <span className="text-sm text-muted-foreground line-through">{formatMoney(compareAtPrice)}</span> : null}
    </div>
  );
}
