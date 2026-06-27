import { cn } from "../lib/utils";

interface Props {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
  /** Optional "13–24 of 57" summary line shown above the controls. */
  from?: number;
  to?: number;
  total?: number;
  className?: string;
}

/** Compact page list with first/last always shown and an ellipsis gap. */
function pageWindow(page: number, total: number): (number | "…")[] {
  const out: (number | "…")[] = [];
  for (let n = 1; n <= total; n++) {
    if (n === 1 || n === total || (n >= page - 1 && n <= page + 1)) out.push(n);
    else if (out[out.length - 1] !== "…") out.push("…");
  }
  return out;
}

export default function Pagination({ page, totalPages, onPage, from, to, total, className }: Props) {
  if (totalPages <= 1) return null;
  const nums = pageWindow(page, totalPages);

  return (
    <div className={cn("flex flex-col items-center gap-2 mt-6", className)}>
      {total != null && from != null && to != null && (
        <p className="font-mono text-[12px] tracking-wide uppercase text-steel">{from}–{to} of {total}</p>
      )}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>← Prev</button>
        {nums.map((n, i) =>
          n === "…" ? (
            <span key={`gap-${i}`} className="px-1.5 text-steel font-mono text-[13px]">…</span>
          ) : (
            <button
              key={n}
              onClick={() => onPage(n)}
              aria-current={n === page ? "page" : undefined}
              className={cn(
                "min-w-[36px] h-9 px-2 rounded-lg font-display font-semibold text-[14px] transition-colors",
                n === page ? "bg-corp-orange text-white" : "text-corp-navy hover:bg-line-2"
              )}
            >
              {n}
            </button>
          )
        )}
        <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next →</button>
      </div>
    </div>
  );
}
