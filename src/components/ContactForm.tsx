import { useState } from "react";
import { Check } from "lucide-react";
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
      <div className="bg-[#E8F7EF] border border-[#B6E6CB] text-[#137A43] p-8 lg:p-10 text-center">
        <div className="w-12 h-12 mx-auto grid place-items-center bg-[#137A43] text-white mb-4">
          <Check className="w-6 h-6" strokeWidth={2.2} />
        </div>
        <h3 className="h-card mb-2">Thanks — your inquiry is in.</h3>
        <p className="text-[15px] leading-[1.6]">We'll get back to you at <b>{form.email}</b> shortly.</p>
      </div>
    );
  }

  return (
    <form className="bg-white border border-ref-hair p-6 lg:p-9" onSubmit={onSubmit}>
      {state === "error" && (
        <div className="bg-[#FDECEA] border border-[#F5C2BA] text-[#B23120] px-4 py-3 text-[13.5px] mb-5">
          {err}{contactEmail ? ` You can also email us directly at ${contactEmail}.` : ""}
        </div>
      )}
      <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} className="hidden" aria-hidden="true" />
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className="label-ref">Name *</label><input required className="input-ref" value={form.name} onChange={set("name")} /></div>
        <div><label className="label-ref">Company</label><input className="input-ref" value={form.company} onChange={set("company")} /></div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <div><label className="label-ref">Email *</label><input type="email" required className="input-ref" value={form.email} onChange={set("email")} /></div>
        <div><label className="label-ref">Phone</label><input className="input-ref" value={form.phone} onChange={set("phone")} /></div>
      </div>
      <div className="mt-4">
        <label className="label-ref">What do you need? *</label>
        <textarea required className="input-ref min-h-[150px] resize-y" value={form.message} onChange={set("message")} />
      </div>
      <button type="submit" className="btn-ref-accent mt-6 w-full sm:w-auto disabled:opacity-60" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}
