import Link from "next/link";
import { notFound } from "next/navigation";
import { DeliveryManager } from "@/components/DeliveryManager";
import { StorageAlert } from "@/components/StorageAlert";
import { UploadPanel } from "@/components/UploadPanel";
import { deliveryUrl, getDelivery, listFiles } from "@/lib/deliveries";
import { storageStatus } from "@/lib/storage";
import { formatBytes, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function DeliveryPage({ params }: { params: { id: string } }) {
  const d = getDelivery(params.id);
  if (!d) notFound();
  const files = listFiles(d.id);
  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/deliveries" className="text-sm text-ink-dim hover:text-gold-soft">← Deliveries</Link>
      <div>
        <h1 className="font-serif text-4xl">{d.title}</h1>
        <p className="mt-1 text-sm text-ink-dim">
          {d.client}{d.event ? ` · ${d.event}` : ""} · {d.status} · {files.length} files, {formatBytes(d.totalBytes)} · expires {formatDate(d.expiresAt)}
        </p>
      </div>
      <StorageAlert />
      <UploadPanel deliveryId={d.id} disabled={!storageStatus().ok} />
      <DeliveryManager d={d} link={deliveryUrl(d.token)} files={files} />
    </div>
  );
}
