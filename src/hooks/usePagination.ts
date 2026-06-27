import { useEffect, useMemo, useState } from "react";

/**
 * Client-side pagination over an in-memory array.
 * Pass a `resetKey` (e.g. the search query) so changing filters jumps back to
 * page 1. The page is also clamped whenever the list shrinks below it.
 */
export function usePagination<T>(items: T[], pageSize = 12, resetKey?: unknown) {
  const [page, setPage] = useState(1);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Jump to page 1 when filters change.
  useEffect(() => { setPage(1); }, [resetKey]);
  // Keep page in range after deletions / filtering.
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  // 1-based index range of the items currently shown, e.g. "13–24 of 57".
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return { page, setPage, totalPages, pageItems, total, from, to };
}
