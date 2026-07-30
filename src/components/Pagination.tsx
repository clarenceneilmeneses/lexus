import { ChevronLeft, ChevronRight } from "lucide-react";
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
    <div className={cn("flex flex-col items-center gap-3 mt-8", className)}>
      {total != null && from != null && to != null && (
        <p className="meta-ref"><span className="tabular-nums">{from}–{to}</span> of <span className="tabular-nums">{total}</span></p>
      )}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        <button
          className="w-9 h-9 grid place-items-center border border-ref-hair text-ref-band hover:border-ref-band disabled:opacity-40 disabled:hover:border-ref-hair transition-colors"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={1.8} />
        </button>
        {nums.map((n, i) =>
          n === "…" ? (
            <span key={`gap-${i}`} className="px-1 text-ref-body/60 font-mono text-[13px]">…</span>
          ) : (
            <button
              key={n}
              onClick={() => onPage(n)}
              aria-current={n === page ? "page" : undefined}
              className={cn(
                "min-w-[36px] h-9 px-2 border font-mono text-[13px] tabular-nums transition-colors",
                n === page
                  ? "bg-ref-band border-ref-band text-white"
                  : "border-ref-hair text-ref-ink hover:border-ref-band"
              )}
            >
              {n}
            </button>
          )
        )}
        <button
          className="w-9 h-9 grid place-items-center border border-ref-hair text-ref-band hover:border-ref-band disabled:opacity-40 disabled:hover:border-ref-hair transition-colors"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
