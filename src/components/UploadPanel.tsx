"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Pause, Play, X, RotateCcw } from "lucide-react";
import { formatBytes } from "@/lib/format";

type Status = "queued" | "uploading" | "paused" | "done" | "error" | "cancelled";
interface Item { key: string; name: string; size: number; status: Status; sent: number; error?: string }
interface Ctl { paused: boolean; cancelled: boolean; abort?: AbortController; sessionId?: string; file: File }

const ACCEPT = ".mp4,.mov,.mkv,.avi,.jpg,.jpeg,.png,.pdf,.zip";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
class Fatal extends Error {}

async function api(url: string, method: string, body?: unknown) {
  const r = await fetch(url, { method, headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Fatal(j.error || `HTTP ${r.status}`);
  return j;
}

async function sha256Hex(blob: Blob): Promise<string | undefined> {
  if (!window.crypto?.subtle) return undefined; // only available on https / localhost
  const d = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
  return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function putChunk(sid: string, i: number, blob: Blob, signal: AbortSignal) {
  const hash = await sha256Hex(blob);
  for (let attempt = 0; ; attempt++) {
    try {
      const r = await fetch(`/api/admin/uploads/${sid}/chunks/${i}`, {
        method: "PUT", body: blob, signal,
        headers: { "content-type": "application/octet-stream", ...(hash ? { "x-chunk-sha256": hash } : {}) },
      });
      if (r.ok) return;
      const retryable = r.status >= 500 || r.status === 408 || r.status === 422;
      if (!retryable) throw new Fatal((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
    } catch (e) {
      if (signal.aborted || e instanceof Fatal) throw e;
    }
    if (attempt >= 4) throw new Error("Chunk failed after several retries");
    await sleep(1000 * 2 ** attempt);
  }
}

export function UploadPanel({ deliveryId, disabled }: { deliveryId: string; disabled?: boolean }) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const ctl = useRef(new Map<string, Ctl>());
  const queue = useRef<Promise<void>>(Promise.resolve());
  const patch = (key: string, p: Partial<Item>) => setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...p } : i)));

  async function run(key: string) {
    const c = ctl.current.get(key)!;
    if (c.cancelled) return;
    const file = c.file;
    c.paused = false;
    patch(key, { status: "uploading", error: undefined });
    try {
      const init = await api("/api/admin/uploads", "POST", { deliveryId, filename: file.name, size: file.size, mime: file.type });
      c.sessionId = init.id;
      const done = new Set<number>(init.received);
      let sent = 0;
      for (const i of done) sent += Math.min(init.chunkSize, file.size - i * init.chunkSize);
      patch(key, { sent });
      for (let i = 0; i < init.totalChunks; i++) {
        if (done.has(i)) continue;
        while (c.paused && !c.cancelled) await sleep(300);
        if (c.cancelled) return;
        const start = i * init.chunkSize;
        const blob = file.slice(start, Math.min(start + init.chunkSize, file.size));
        c.abort = new AbortController();
        await putChunk(init.id, i, blob, c.abort.signal);
        sent += blob.size;
        patch(key, { sent });
      }
      await api(`/api/admin/uploads/${init.id}/complete`, "POST", {});
      patch(key, { status: "done", sent: file.size });
      router.refresh();
    } catch (e) {
      if (c.cancelled) return;
      patch(key, { status: "error", error: (e as Error).message });
    }
  }

  const enqueue = (key: string) => { queue.current = queue.current.then(() => run(key)); };

  function add(files: FileList | null) {
    if (!files) return;
    const added: Item[] = [];
    for (const f of Array.from(files)) {
      const key = `${f.name}-${f.size}-${Date.now()}-${Math.random()}`;
      ctl.current.set(key, { paused: false, cancelled: false, file: f });
      added.push({ key, name: f.name, size: f.size, status: "queued", sent: 0 });
    }
    setItems((p) => [...p, ...added]);
    added.forEach((a) => enqueue(a.key));
  }

  function pause(key: string, paused: boolean) {
    const c = ctl.current.get(key)!;
    c.paused = paused;
    patch(key, { status: paused ? "paused" : "uploading" });
  }

  async function cancel(key: string) {
    const c = ctl.current.get(key)!;
    c.cancelled = true; c.abort?.abort();
    patch(key, { status: "cancelled" });
    if (c.sessionId) await fetch(`/api/admin/uploads/${c.sessionId}`, { method: "DELETE" }).catch(() => {});
  }

  function retry(key: string) { enqueue(key); }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-medium">Upload files</h2>
      <label className={`mt-4 grid cursor-pointer place-items-center rounded-lg border border-dashed border-line px-4 py-10 text-center transition-colors hover:border-gold/60 ${disabled ? "pointer-events-none opacity-50" : ""}`}>
        <UploadCloud className="h-6 w-6 text-gold" />
        <span className="mt-2 text-sm">Choose files to upload</span>
        <span className="mt-1 text-xs text-ink-dim">MP4, MOV, MKV, AVI, JPG, PNG, PDF, ZIP · large files are sent in resumable chunks</span>
        <input type="file" multiple accept={ACCEPT} className="sr-only" disabled={disabled} onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      </label>
      <p className="mt-2 text-xs text-ink-dim">
        If a transfer is interrupted or you refresh, choose the same file again and it resumes where it stopped. Keep this tab open while uploading.
      </p>
      {items.length > 0 && (
        <ul className="mt-5 space-y-3">
          {items.map((it) => {
            const pct = it.size ? Math.round((it.sent / it.size) * 100) : 0;
            return (
              <li key={it.key} className="rounded-lg border border-line bg-surface2 p-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate">{it.name}</span>
                  <span className="shrink-0 text-xs text-ink-dim">{formatBytes(it.size)}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded bg-line"><div className="h-full bg-gold transition-all" style={{ width: `${pct}%` }} /></div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className={it.status === "error" ? "text-red-400" : it.status === "done" ? "text-emerald-400" : "text-ink-dim"}>
                    {it.status === "error" ? it.error : it.status === "uploading" ? `Uploading ${pct}%` : it.status === "done" ? "Uploaded" : it.status[0].toUpperCase() + it.status.slice(1)}
                  </span>
                  <span className="flex gap-3 text-ink-dim">
                    {it.status === "uploading" && <button onClick={() => pause(it.key, true)} aria-label="Pause"><Pause className="h-4 w-4 hover:text-ink" /></button>}
                    {it.status === "paused" && <button onClick={() => pause(it.key, false)} aria-label="Resume"><Play className="h-4 w-4 hover:text-ink" /></button>}
                    {it.status === "error" && <button onClick={() => retry(it.key)} aria-label="Retry"><RotateCcw className="h-4 w-4 hover:text-ink" /></button>}
                    {["queued", "uploading", "paused", "error"].includes(it.status) && <button onClick={() => cancel(it.key)} aria-label="Cancel upload"><X className="h-4 w-4 hover:text-red-400" /></button>}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
