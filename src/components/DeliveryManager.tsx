"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, RefreshCw, Trash2, Power, Lock, LockOpen } from "lucide-react";
import { formatBytes, formatDate } from "@/lib/format";
import type { DeliveryRow, FileRow } from "@/lib/deliveries";

async function call(url: string, method: string, body?: unknown) {
  const r = await fetch(url, { method, headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
}

export function DeliveryManager({ d, link, files }: { d: DeliveryRow; link: string; files: FileRow[] }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState("");
  const [expiry, setExpiry] = useState("30");
  const [custom, setCustom] = useState("");
  const [pw, setPw] = useState("");

  async function act(fn: () => Promise<void>, after?: () => void) {
    setErr("");
    try { await fn(); after ? after() : router.refresh(); } catch (e) { setErr((e as Error).message); }
  }
  const patch = (body: unknown) => act(() => call(`/api/admin/deliveries/${d.id}`, "PATCH", body));

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <p className="label">Private delivery link</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input readOnly value={link} className="input font-mono text-xs" onFocus={(e) => e.currentTarget.select()} aria-label="Delivery link" />
          <button className="btn-gold shrink-0" onClick={async () => { try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { window.prompt("Copy this link", link); } }}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy link"}
          </button>
        </div>
        <p className="mt-2 text-xs text-ink-dim">The client page itself is Stage 4; until then this link shows a placeholder with the file list only.</p>
        <button className="btn-ghost mt-4 !py-2" onClick={() => { if (confirm("Regenerate the link? The old link will stop working.")) patch({ regenerateToken: true }); }}>
          <RefreshCw className="h-4 w-4" /> Regenerate link
        </button>
      </div>

      <div className="card space-y-5 p-6">
        <div className="flex flex-wrap gap-3">
          <button className="btn-ghost !py-2" onClick={() => patch({ enabled: !d.enabled })}><Power className="h-4 w-4" /> {d.enabled ? "Disable link" : "Enable link"}</button>
          <button className="btn-ghost !py-2" onClick={() => patch({ allowDownloads: !d.allowDownloads })}>Downloads: {d.allowDownloads ? "on" : "off"}</button>
          <button className="btn-ghost !py-2" onClick={() => patch({ allowPreviews: !d.allowPreviews })}>Previews: {d.allowPreviews ? "on" : "off"}</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="exp">Change expiry (currently {formatDate(d.expiresAt)})</label>
            <div className="flex gap-2">
              <select id="exp" className="input" value={expiry} onChange={(e) => setExpiry(e.target.value)}>
                <option value="7">7 days from now</option><option value="15">15 days from now</option><option value="30">30 days from now</option><option value="custom">Custom date</option>
              </select>
              {expiry === "custom" && <input type="date" className="input" value={custom} onChange={(e) => setCustom(e.target.value)} />}
              <button className="btn-ghost shrink-0 !py-2" onClick={() => patch(expiry === "custom" ? { customDate: custom } : { expiryDays: Number(expiry) })}>Set</button>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="pw">Password ({d.hasPassword ? "set" : "none"})</label>
            <div className="flex gap-2">
              <input id="pw" type="password" autoComplete="new-password" className="input" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" />
              <button className="btn-ghost shrink-0 !py-2" disabled={pw.length < 6} onClick={() => patch({ password: pw }).then(() => setPw(""))}><Lock className="h-4 w-4" /></button>
              {d.hasPassword && <button className="btn-ghost shrink-0 !py-2" title="Remove password" onClick={() => patch({ password: null })}><LockOpen className="h-4 w-4" /></button>}
            </div>
          </div>
        </div>
        {err && <p role="alert" className="text-sm text-red-400">{err}</p>}
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-line p-4 text-sm font-medium">Files ({files.length})</div>
        {files.length === 0 ? (
          <p className="p-6 text-sm text-ink-dim">No files yet. Upload some below.</p>
        ) : (
          <ul>
            {files.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 border-b border-line/60 px-4 py-3 text-sm last:border-0">
                <span className="truncate">{f.name}</span>
                <span className="flex shrink-0 items-center gap-4 text-ink-dim">
                  {formatBytes(f.size)}
                  <button aria-label={`Delete ${f.name}`} onClick={() => { if (confirm(`Delete ${f.name}?`)) act(() => call(`/api/admin/files/${f.id}`, "DELETE")); }}>
                    <Trash2 className="h-4 w-4 hover:text-red-400" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card border-red-500/30 p-6">
        <p className="text-sm font-medium text-red-300">Danger zone</p>
        <p className="mt-1 text-xs text-ink-dim">Deletes this delivery and all its files from the drive. This cannot be undone.</p>
        <button className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
          onClick={() => { if (confirm(`Permanently delete "${d.title}" and its ${files.length} file(s)?`)) act(() => call(`/api/admin/deliveries/${d.id}`, "DELETE"), () => { router.push("/admin/deliveries"); router.refresh(); }); }}>
          <Trash2 className="h-4 w-4" /> Delete delivery
        </button>
      </div>
    </div>
  );
}
