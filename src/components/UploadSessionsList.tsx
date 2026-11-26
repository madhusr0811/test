"use client";
import { useRouter } from "next/navigation";
import { formatBytes } from "@/lib/format";

export interface SessionRow { id: string; filename: string; size: number; status: string; totalChunks: number; receivedChunks: number; client: string; title: string; updatedAt: string }

export function UploadSessionsList({ rows }: { rows: SessionRow[] }) {
  const router = useRouter();
  if (rows.length === 0) return <p className="card p-6 text-sm text-ink-dim">No uploads yet.</p>;
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-ink-dim">
          <tr className="border-b border-line"><th className="px-4 py-3">File</th><th className="px-4 py-3">Delivery</th><th className="px-4 py-3">Size</th><th className="px-4 py-3">Progress</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-line/60 last:border-0">
              <td className="px-4 py-3">{r.filename}</td>
              <td className="px-4 py-3 text-ink-dim">{r.client} — {r.title}</td>
              <td className="whitespace-nowrap px-4 py-3 text-ink-dim">{formatBytes(r.size)}</td>
              <td className="px-4 py-3 text-ink-dim">{r.status === "complete" ? "100%" : `${Math.round((r.receivedChunks / r.totalChunks) * 100)}%`}</td>
              <td className="px-4 py-3 capitalize">{r.status === "active" ? "Incomplete" : r.status}</td>
              <td className="px-4 py-3">
                {r.status === "active" && (
                  <button className="text-red-300 hover:text-red-200" onClick={async () => { await fetch(`/api/admin/uploads/${r.id}`, { method: "DELETE" }); router.refresh(); }}>Discard</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
