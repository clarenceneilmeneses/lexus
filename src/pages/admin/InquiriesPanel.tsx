import { useEffect, useMemo, useState } from "react";
import type { Inquiry } from "../../lib/types";
import { deleteInquiry, fetchInquiries, setInquiryStatus } from "../../lib/api";
import { cn } from "../../lib/utils";

const PILL: Record<Inquiry["status"], string> = {
  new: "bg-accent-soft text-accent-d",
  read: "bg-[#E8EDF5] text-[#3A567F]",
  archived: "bg-line-2 text-steel",
};
type Filter = "all" | Inquiry["status"];

export default function InquiriesPanel({ canWrite, canDelete }: { canWrite: boolean; canDelete: boolean }) {
  const [rows, setRows] = useState<Inquiry[] | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  async function load() { setRows(await fetchInquiries()); }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (rows ?? []).filter((r) =>
      (filter === "all" || r.status === filter) &&
      (!t || r.name.toLowerCase().includes(t) || r.email.toLowerCase().includes(t) || (r.subject ?? "").toLowerCase().includes(t) || r.message.toLowerCase().includes(t))
    );
  }, [rows, q, filter]);

  if (rows === null) return <p className="font-mono text-steel">Loading inquiries…</p>;
  const newCount = rows.filter((r) => r.status === "new").length;

  return (
    <div>
      <div className="flex justify-between items-center gap-3 flex-wrap mb-4">
        <h2 className="text-[22px]">Inquiries <span className="text-steel text-[15px]">({newCount} new)</span></h2>
        <div className="flex gap-2 flex-wrap">
          <input className="input max-w-[240px]" placeholder="Search messages…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input max-w-[150px]" value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {!filtered.length && <div className="panel"><p className="text-steel">{rows.length ? "No inquiries match." : "No inquiries yet. Messages from the contact form land here."}</p></div>}
      <div className="space-y-3">
        {filtered.map((r) => (
          <div key={r.id} className="panel py-4">
            <div className="flex justify-between items-start gap-3 flex-wrap">
              <div>
                <b>{r.name}</b>{r.company && <span className="text-steel"> · {r.company}</span>}
                <div className="font-mono text-[12px] text-steel">
                  {r.email}{r.phone ? ` · ${r.phone}` : ""} · {new Date(r.created_at).toLocaleString()}
                </div>
              </div>
              <span className={cn("font-mono text-[10.5px] uppercase tracking-wide px-2 py-0.5 rounded-full", PILL[r.status])}>{r.status}</span>
            </div>
            {r.subject && <div className="font-mono text-[12px] text-accent-d mt-2">{r.subject}</div>}
            <p className="mt-2 whitespace-pre-wrap">{r.message}</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <a className="btn btn-ghost btn-sm" href={`mailto:${r.email}`}>Reply</a>
              {canWrite && r.status !== "read" && <button className="btn btn-ghost btn-sm" onClick={async () => { await setInquiryStatus(r.id, "read"); load(); }}>Mark read</button>}
              {canWrite && r.status !== "archived" && <button className="btn btn-ghost btn-sm" onClick={async () => { await setInquiryStatus(r.id, "archived"); load(); }}>Archive</button>}
              {canDelete && <button className="btn btn-sm bg-[#FCE9E9] text-[#B23030]" onClick={async () => { if (confirm("Delete this inquiry?")) { await deleteInquiry(r.id); load(); } }}>Delete</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
