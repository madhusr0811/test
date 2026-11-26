"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, ArrowUpDown, Copy, Check } from "lucide-react";
import type { DeliveryRow, DeliveryStatus } from "@/lib/deliveries";
import { formatBytes, formatDate } from "@/lib/format";

type SortKey = "client" | "createdAt" | "fileCount" | "totalBytes" | "downloads" | "expiresAt";
type Row = DeliveryRow & { link: string };

const badge: Record<DeliveryStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-400",
  expired: "bg-neutral-500/15 text-neutral-400",
  disabled: "bg-amber-500/10 text-amber-400",
};

export function DeliveriesTable({ rows, limit }: { rows: Row[]; limit?: number }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | DeliveryStatus>("all");
  const [sort, setSort] = useState<SortKey>("createdAt");
  const [dir, setDir] = useState<1 | -1>(-1);
  const [copied, setCopied] = useState("");

  const data = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const f = rows.filter((r) => (status === "all" || r.status === status) && (!needle || `${r.client} ${r.event} ${r.title}`.toLowerCase().includes(needle)));
    f.sort((a, b) => (a[sort] < b[sort] ? -1 : a[sort] > b[sort] ? 1 : 0) * dir);
    return limit ? f.slice(0, limit) : f;
  }, [rows, q, status, sort, dir, limit]);

  async function copy(r: Row) {
    try { await navigator.clipboard.writeText(r.link); setCopied(r.id); setTimeout(() => setCopied(""), 1500); }
    catch { window.prompt("Copy this link", r.link); }
  }

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
              <th className="px-4 py-3 font-medium">Event / project</th>
              {th("createdAt", "Created")}
              {th("fileCount", "Files")}
              {th("totalBytes", "Size")}
              {th("downloads", "Downloads")}
              {th("expiresAt", "Expiry")}
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.id} className="border-b border-line/60 last:border-0 hover:bg-surface2/50">
                <td className="whitespace-nowrap px-4 py-3 font-medium">{r.client}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-dim">{r.event || r.title}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-dim">{formatDate(r.createdAt)}</td>
                <td className="px-4 py-3 text-ink-dim">{r.fileCount}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-dim">{formatBytes(r.totalBytes)}</td>
                <td className="px-4 py-3 text-ink-dim">{r.downloads}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-dim">{formatDate(r.expiresAt)}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs capitalize ${badge[r.status]}`}>{r.status}</span></td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => copy(r)} className="inline-flex items-center gap-1 text-gold hover:text-gold-soft" aria-label="Copy delivery link">
                      {copied === r.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <Link href={`/admin/deliveries/${r.id}`} className="text-gold hover:text-gold-soft">Manage</Link>
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-ink-dim">No deliveries yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
