export function SupplierCardSkeleton() {
  return (
    <div className="glass card border border-[var(--border)] animate-pulse">
      <div className="grid grid-cols-[auto,1fr,auto] items-center gap-3">
        <div className="w-[54px] h-[54px] rounded-[14px] bg-[rgba(255,255,255,.06)]" />
        <div className="min-w-0 space-y-2">
          <div className="h-4 w-40 rounded bg-[rgba(255,255,255,.06)]" />
          <div className="h-3 w-56 rounded bg-[rgba(255,255,255,.06)]" />
          <div className="h-3 w-24 rounded bg-[rgba(255,255,255,.06)]" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-7 w-[92px] rounded-[16px] border border-[var(--border)] bg-[rgba(255,255,255,.02)]" />
          <div className="h-7 w-[92px] rounded-[16px] border border-[var(--border)] bg-[rgba(255,255,255,.02)]" />
        </div>
      </div>
    </div>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="glass card border border-[var(--border)] animate-pulse">
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div className="min-w-0 space-y-2">
          <div className="h-3 w-48 rounded bg-[rgba(255,255,255,.06)]" />
          <div className="h-4 w-64 rounded bg-[rgba(255,255,255,.06)]" />
          <div className="h-3 w-40 rounded bg-[rgba(255,255,255,.06)]" />
          <div className="flex gap-2">
            <div className="h-7 w-[130px] rounded-[16px] border border-[var(--border)] bg-[rgba(255,255,255,.02)]" />
            <div className="h-7 w-[150px] rounded-[16px] border border-[var(--border)] bg-[rgba(255,255,255,.02)]" />
          </div>
        </div>
        <div className="shrink-0 pl-2 text-right">
          <div className="h-3 w-10 rounded bg-[rgba(255,255,255,.06)] ml-auto" />
          <div className="h-4 w-24 rounded bg-[rgba(255,255,255,.06)] mt-1 ml-auto" />
          <div className="h-3 w-12 rounded bg-[rgba(255,255,255,.06)] mt-2 ml-auto" />
          <div className="h-4 w-16 rounded bg-[rgba(255,255,255,.06)] mt-1 ml-auto" />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="aspect-square rounded-lg bg-[rgba(255,255,255,.06)]"></div>
        <div className="aspect-square rounded-lg bg-[rgba(255,255,255,.06)]"></div>
        <div className="aspect-square rounded-lg bg-[rgba(255,255,255,.06)]"></div>
      </div>
    </div>
  );
}
