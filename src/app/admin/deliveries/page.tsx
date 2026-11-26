import Link from "next/link";
import { Plus } from "lucide-react";
import { DeliveriesTable } from "@/components/DeliveriesTable";
import { Notice } from "@/components/Notice";
import { sampleDeliveries } from "@/lib/sample-data";

export default function Deliveries() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-4xl">Deliveries</h1>
        <Link href="/admin/deliveries/new" className="btn-gold"><Plus className="h-4 w-4" /> New delivery</Link>
      </div>
      <Notice>Sample data. Search, filter and sorting work; row actions (copy link, disable, regenerate, delete) arrive in Stage 2.</Notice>
      <DeliveriesTable rows={sampleDeliveries} />
    </div>
  );
}
