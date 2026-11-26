import { AlertTriangle } from "lucide-react";
import { storageStatus } from "@/lib/storage";

export function StorageAlert() {
  const st = storageStatus();
  if (st.ok) return null;
  return (
    <div role="alert" className="flex items-start gap-3 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div><strong>Storage unavailable.</strong> {st.reason} Uploads are disabled until this is fixed. Files are never saved to another location.</div>
    </div>
  );
}
