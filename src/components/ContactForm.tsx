import { useState } from "react";
import { submitInquiry } from "../lib/api";

/** Shared inquiry form — used on the homepage and the Contact page. */
export default function ContactForm({ productSubject, contactEmail }: { productSubject?: string | null; contactEmail?: string }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "",
    message: productSubject ? `I'd like a quote for: ${productSubject}\n\n` : "",
    website: "", // honeypot — bots fill this, humans don't
  });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState("");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.website) return; // honeypot tripped
    if (!form.name || !form.email || !form.message) return;
    setState("sending"); setErr("");
    try {
      await submitInquiry({
        name: form.name, email: form.email, phone: form.phone, company: form.company,
        subject: productSubject ? `Quote: ${productSubject}` : "Website inquiry", message: form.message,
      });
      setState("sent");
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong."); setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="bg-[#E8F7EF] border border-[#B6E6CB] text-[#137A43] rounded-3xl p-8 text-center">
        <div className="w-12 h-12 mx-auto grid place-items-center rounded-full bg-[#137A43] text-white text-2xl mb-3">✓</div>
        <h3 className="text-2xl font-semibold tracking-tight mb-1.5">Thanks — your inquiry is in.</h3>
        <p>We'll get back to you at <b>{form.email}</b> shortly.</p>
      </div>
    );
  }

  return (
    <form className="bg-white border border-line rounded-3xl p-6 lg:p-8 shadow-card" onSubmit={onSubmit}>
      {state === "error" && (
        <div className="bg-[#FDECEA] border border-[#F5C2BA] text-[#B23120] px-4 py-3 rounded text-[13.5px] mb-4">
          {err}{contactEmail ? ` You can also email us directly at ${contactEmail}.` : ""}
        </div>
      )}
      <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} className="hidden" aria-hidden="true" />
      <div className="grid sm:grid-cols-2 gap-3.5">
        <div><label className="field-label">Name *</label><input required className="input" value={form.name} onChange={set("name")} /></div>
        <div><label className="field-label">Company</label><input className="input" value={form.company} onChange={set("company")} /></div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3.5 mt-3.5">
        <div><label className="field-label">Email *</label><input type="email" required className="input" value={form.email} onChange={set("email")} /></div>
        <div><label className="field-label">Phone</label><input className="input" value={form.phone} onChange={set("phone")} /></div>
      </div>
      <div className="mt-3.5">
        <label className="field-label">What do you need? *</label>
        <textarea required className="input min-h-[140px] resize-y" value={form.message} onChange={set("message")} />
      </div>
      <button
        type="submit"
        className="inline-flex items-center justify-center font-display font-semibold text-[15px] rounded-full px-7 py-3 bg-corp-orange text-white hover:bg-corp-orangeD transition-colors mt-5 w-full sm:w-auto disabled:opacity-60"
        disabled={state === "sending"}
      >
        {state === "sending" ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}
