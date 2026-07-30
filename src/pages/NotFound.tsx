import { Link } from "react-router-dom";
import { ArrowLeft, PackageSearch } from "lucide-react";

export default function NotFound() {
  return (
    <section className="bg-ref-off">
      <div className="band py-28 lg:py-36 text-center">
        <PackageSearch className="w-10 h-10 mx-auto text-ref-body/40" strokeWidth={1.4} />
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-ref-accent mt-6">Error 404</div>
        <h1 className="num text-[clamp(60px,13vw,150px)] leading-none mt-3 text-ref-band">404</h1>
        <p className="copy mt-3 mb-9">This page isn't in the catalog.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/" className="btn-ref-accent">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.9} /> Back home
          </Link>
          <Link to="/products" className="btn-ref-out">Browse products</Link>
        </div>
      </div>
    </section>
  );
}
