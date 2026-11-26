"use client";
import { useMemo, useState } from "react";
import { Search, ArrowUpDown } from "lucide-react";
import type { DeliveryRow, DeliveryStatus } from "@/lib/sample-data";

type SortKey = "client" | "created" | "files" | "sizeGB" | "downloads" | "expiry";

const badge: Record<DeliveryStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-400",
  expired: "bg-neutral-500/15 text-neutral-400",
  disabled: "bg-amber-500/10 text-amber-400",
};

const fmtDate = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const fmtSize = (gb: number) => (gb >= 1 ? `${gb.toFixed(1)} GB` : `${Math.round(gb * 1024)} MB`);

export function DeliveriesTable({ rows, limit }: { rows: DeliveryRow[]; limit?: number }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | DeliveryStatus>("all");
  const [sort, setSort] = useState<SortKey>("created");
  const [dir, setDir] = useState<1 | -1>(-1);

  const data = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = rows.filter(
      (r) => (status === "all" || r.status === status) && (!needle || `${r.client} ${r.event}`.toLowerCase().includes(needle)),
    );
    filtered.sort((a, b) => {
      const x = a[sort], y = b[sort];
      return (x < y ? -1 : x > y ? 1 : 0) * dir;
    });
    return limit ? filtered.slice(0, limit) : filtered;
  }, [rows, q, status, sort, dir, limit]);

  const th = (key: SortKey, label: string) => (
    <th className="whitespace-nowrap px-4 py-3 font-medium">
      <button onClick={() => { if (sort === key) setDir((d) => (d === 1 ? -1 : 1)); else { setSort(key); setDir(-1); } }} className="inline-flex items-center gap-1 hover:text-ink">
        {label} <ArrowUpDown className="h-3 w-3 opacity-60" />
      </button>
    </th>
  );

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search client or event…" className="input !pl-9" aria-label="Search deliveries" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="input sm:w-40" aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-ink-dim">
            <tr className="border-b border-line">
              {th("client", "Client")}
              <th className="px-4 py-3 font-medium">Event</th>
              {th("created", "Created")}
              {th("files", "Files")}
              {th("sizeGB", "Size")}
              {th("downloads", "Downloads")}
              {th("expiry", "Expiry")}
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.id} className="border-b border-line/60 last:border-0 hover:bg-surface2/50">
                <td className="whitespace-nowrap px-4 py-3 font-medium">{r.client}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-dim">{r.event}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-dim">{fmtDate(r.created)}</td>
                <td className="px-4 py-3 text-ink-dim">{r.files}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-dim">{fmtSize(r.sizeGB)}</td>
                <td className="px-4 py-3 text-ink-dim">{r.downloads}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-dim">{fmtDate(r.expiry)}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs capitalize ${badge[r.status]}`}>{r.status}</span></td>
                <td className="px-4 py-3 text-xs text-ink-dim/60" title="Actions arrive in Stage 2">Stage 2</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-ink-dim">No deliveries match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
