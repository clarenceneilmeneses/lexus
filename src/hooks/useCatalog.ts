import { useCallback, useEffect, useState } from "react";
import { fetchCatalog } from "../lib/api";
import type { Catalog } from "../lib/types";

export function useCatalog(includeUnpublished = false) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setCatalog(await fetchCatalog(includeUnpublished));
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load catalog.");
    } finally {
      setLoading(false);
    }
  }, [includeUnpublished]);

  useEffect(() => { reload(); }, [reload]);
  return { catalog, error, loading, reload };
}
