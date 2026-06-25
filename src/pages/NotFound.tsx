import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="section-light">
      <div className="wrap py-32 text-center">
        <div className="font-mono text-corp-orange text-sm tracking-[0.16em]">ERROR 404</div>
        <h1 className="font-display font-semibold text-[clamp(64px,14vw,160px)] leading-none mt-3 tracking-tight text-corp-navy">404</h1>
        <p className="text-corp-grey text-lg mt-2 mb-8">This page isn't in the catalog.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/" className="pill-orange">← Back home</Link>
          <Link to="/products" className="pill-outline">Browse products</Link>
        </div>
      </div>
    </section>
  );
}
