import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Notice } from "@/components/Notice";
import { getDb } from "@/lib/db";
import { formatBytes } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

// PLACEHOLDER (Stage 4 builds the real client page: password form, previews, downloads).
// Deliberately shows no file names or details for password-protected deliveries.
export default function DeliveryPlaceholder({ params }: { params: { token: string } }) {
  const d = getDb().prepare("SELECT id, title, client, expires_at, enabled, password_hash FROM deliveries WHERE token = ?").get(params.token) as
    { id: string; title: string; client: string; expires_at: string; enabled: number; password_hash: string | null } | undefined;
  if (!d || !d.enabled || d.expires_at < new Date().toISOString()) notFound();
  const files = d.password_hash ? [] : (getDb().prepare("SELECT name, size FROM files WHERE delivery_id = ?").all(d.id) as { name: string; size: number }[]);
  return (
    <main className="mx-auto max-w-xl px-5 py-16 text-center">
      <Logo />
      <h1 className="mt-12 font-serif text-4xl">{d.client}</h1>
      <p className="mt-2 text-ink-dim">{d.title}</p>
      <div className="mt-8 text-left"><Notice>Downloads are not available yet — the full delivery page is still being built.</Notice></div>
      {files.length > 0 && (
        <ul className="card mt-6 text-left text-sm">
          {files.map((f) => <li key={f.name} className="flex justify-between border-b border-line/60 px-4 py-3 last:border-0"><span>{f.name}</span><span className="text-ink-dim">{formatBytes(f.size)}</span></li>)}
        </ul>
      )}
    </main>
  );
}
