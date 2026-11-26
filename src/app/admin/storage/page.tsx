import Link from "next/link";
import { StorageAlert } from "@/components/StorageAlert";
import { Notice } from "@/components/Notice";
import { config } from "@/lib/config";
import { getDb } from "@/lib/db";
import { listDeliveries } from "@/lib/deliveries";
import { diskStats, storageStatus } from "@/lib/storage";
import { formatBytes } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function Storage() {
  const st = storageStatus();
  const disk = st.ok ? diskStats() : null;
  const files = getDb().prepare("SELECT COUNT(*) AS n, COALESCE(SUM(size),0) AS bytes FROM files").get() as { n: number; bytes: number };
  const all = listDeliveries();
  const largest = [...all].sort((a, b) => b.totalBytes - a.totalBytes).slice(0, 8);
  const usedPct = disk ? Math.round(((disk.total - disk.free) / disk.total) * 100) : 0;
  const warn = disk && usedPct >= config.storageWarnPercent;
  const cards = [
    { label: "Total capacity", value: disk ? formatBytes(disk.total) : "—" },
    { label: "Used (whole drive)", value: disk ? formatBytes(disk.total - disk.free) : "—" },
    { label: "Free", value: disk ? formatBytes(disk.free) : "—" },
    { label: "Delivery files", value: formatBytes(files.bytes) },
    { label: "Files", value: String(files.n) },
    { label: "Active deliveries", value: String(all.filter((d) => d.status === "active").length) },
  ];
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl">Storage</h1>
      <StorageAlert />
      {warn && <Notice>Drive is {usedPct}% full (warning threshold {config.storageWarnPercent}%). Delete old deliveries to free space.</Notice>}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-xs uppercase tracking-wider text-ink-dim">{c.label}</p>
            <p className="mt-2 font-serif text-3xl text-gold-soft">{c.value}</p>
          </div>
        ))}
      </div>
      {disk && (
        <div className="card p-5">
          <div className="mb-2 flex justify-between text-xs text-ink-dim"><span>Drive usage</span><span>{usedPct}%</span></div>
          <div className="h-2 overflow-hidden rounded bg-line"><div className={`h-full ${warn ? "bg-red-400" : "bg-gold"}`} style={{ width: `${usedPct}%` }} /></div>
        </div>
      )}
      <section>
        <h2 className="mb-3 text-lg font-medium">Largest deliveries</h2>
        <div className="card">
          {largest.length === 0 ? <p className="p-6 text-sm text-ink-dim">Nothing stored yet.</p> : (
            <ul>
              {largest.map((d) => (
                <li key={d.id} className="flex items-center justify-between border-b border-line/60 px-4 py-3 text-sm last:border-0">
                  <span>{d.client} — {d.title}</span>
                  <span className="flex items-center gap-4 text-ink-dim">{formatBytes(d.totalBytes)}<Link className="text-gold hover:text-gold-soft" href={`/admin/deliveries/${d.id}`}>Manage</Link></span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <p className="text-xs text-ink-dim">Storage path: {config.storagePath}</p>
    </div>
  );
}
