import Link from "next/link";
import { Plus } from "lucide-react";
import { DeliveriesTable } from "@/components/DeliveriesTable";
import { Notice } from "@/components/Notice";
import { sampleDeliveries, sampleStats } from "@/lib/sample-data";

export default function Dashboard() {
  const s = sampleStats;
  const pct = Math.round((s.storageUsedGB / s.storageTotalGB) * 100);
  const stats = [
    { label: "Total deliveries", value: s.totalDeliveries },
    { label: "Active links", value: s.activeLinks },
    { label: "Total downloads", value: s.totalDownloads },
    { label: "Storage used", value: `${s.storageUsedGB.toFixed(1)} GB`, sub: `${pct}% of drive` },
    { label: "Storage available", value: `${(s.storageTotalGB - s.storageUsedGB).toFixed(0)} GB` },
  ];
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-4xl">Dashboard</h1>
        <Link href="/admin/deliveries/new" className="btn-gold"><Plus className="h-4 w-4" /> New delivery</Link>
      </div>
      <Notice>Showing sample data. Real deliveries, stats and storage figures are connected in Stages 2–3.</Notice>
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
        <DeliveriesTable rows={sampleDeliveries} limit={5} />
      </section>
    </div>
  );
}
