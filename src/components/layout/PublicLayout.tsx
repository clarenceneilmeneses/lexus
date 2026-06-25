import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTop from "../ScrollToTop";
import { useCatalog } from "../../hooks/useCatalog";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import type { Catalog } from "../../lib/types";

export interface PublicContext { catalog: Catalog; reload: () => void; }

export default function PublicLayout() {
  const { catalog, loading, error } = useCatalog(false);
  const loc = useLocation();

  // Re-arm scroll reveals on every route change once data is present.
  useScrollReveal([loc.pathname, !!catalog]);

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <ScrollToTop />
      <Header categories={catalog?.categories ?? []} />
      <main className="flex-1">
        {loading && (
          <div className="wrap py-32 flex flex-col items-center gap-4 text-center">
            <span className="w-10 h-10 rounded-full border-2 border-line border-t-brand animate-spin" />
            <p className="font-mono text-[13px] tracking-wide text-steel uppercase">Loading catalog…</p>
          </div>
        )}
        {error && (
          <div className="wrap py-24 text-center max-w-lg">
            <h2 className="text-2xl mb-2">Couldn't reach the catalog</h2>
            <p className="text-steel">{error}</p>
            <p className="text-steel text-sm mt-2">
              Check that the database schema has been run and your <code className="font-mono">.env</code> keys are set.
            </p>
          </div>
        )}
        {catalog && <Outlet context={{ catalog } satisfies { catalog: Catalog }} />}
      </main>
      {catalog && <Footer contact={catalog.settings.contact} social={catalog.settings.social} categories={catalog.categories} />}
    </div>
  );
}
