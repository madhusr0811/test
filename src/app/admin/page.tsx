import Link from "next/link";
import { Plus } from "lucide-react";
import { DeliveriesTable } from "@/components/DeliveriesTable";
import { StorageAlert } from "@/components/StorageAlert";
import { deliveryUrl, listDeliveries } from "@/lib/deliveries";
import { getDb } from "@/lib/db";
import { diskStats } from "@/lib/storage";
import { formatBytes } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const rows = listDeliveries().map((d) => ({ ...d, link: deliveryUrl(d.token) }));
  const used = (getDb().prepare("SELECT COALESCE(SUM(size),0) AS s FROM files").get() as { s: number }).s;
  const disk = diskStats();
  const stats = [
    { label: "Total deliveries", value: String(rows.length) },
    { label: "Active links", value: String(rows.filter((r) => r.status === "active").length) },
    { label: "Total downloads", value: String(rows.reduce((a, r) => a + r.downloads, 0)), sub: "Tracking starts Stage 4–5" },
    { label: "Storage used", value: formatBytes(used), sub: "by delivered files" },
    { label: "Storage available", value: disk ? formatBytes(disk.free) : "—", sub: disk ? `of ${formatBytes(disk.total)}` : "unavailable" },
  ];
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-4xl">Dashboard</h1>
        <Link href="/admin/deliveries/new" className="btn-gold"><Plus className="h-4 w-4" /> New delivery</Link>
      </div>
      <StorageAlert />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map((x) => (
          <div key={x.label} className="card p-5">
            <p className="text-xs uppercase tracking-wider text-ink-dim">{x.label}</p>
            <p className="mt-2 font-serif text-3xl text-gold-soft">{x.value}</p>
            {x.sub && <p className="mt-1 text-xs text-ink-dim">{x.sub}</p>}
          </div>
        ))}
      </div>
      <section>
        <h2 className="mb-3 text-lg font-medium">Recent deliveries</h2>
        <DeliveriesTable rows={rows} limit={5} />
      </section>
    </div>
  );
}
