import Link from "next/link";
import { Plus } from "lucide-react";
import { DeliveriesTable } from "@/components/DeliveriesTable";
import { deliveryUrl, listDeliveries } from "@/lib/deliveries";

export const dynamic = "force-dynamic";

export default function Deliveries() {
  const rows = listDeliveries().map((d) => ({ ...d, link: deliveryUrl(d.token) }));
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-4xl">Deliveries</h1>
        <Link href="/admin/deliveries/new" className="btn-gold"><Plus className="h-4 w-4" /> New delivery</Link>
      </div>
      <DeliveriesTable rows={rows} />
    </div>
  );
}
