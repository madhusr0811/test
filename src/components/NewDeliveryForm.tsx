"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewDeliveryForm() {
  const router = useRouter();
  const [expiry, setExpiry] = useState("30");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError("");
    const f = new FormData(e.currentTarget);
    const body = {
      client: f.get("client"), event: f.get("event"), title: f.get("title"), message: f.get("message"),
      deliveryDate: f.get("deliveryDate"), password: f.get("password"),
      allowPreviews: f.get("allowPreviews") === "on", allowDownloads: f.get("allowDownloads") === "on",
      ...(expiry === "custom" ? { customDate: f.get("customDate") } : { expiryDays: Number(expiry) }),
    };
    const r = await fetch("/api/admin/deliveries", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (r.ok) { router.push(`/admin/deliveries/${j.id}`); return; }
    setError(j.error || "Could not create delivery"); setBusy(false);
  }

  return (
    <form onSubmit={submit} className="card max-w-2xl space-y-5 p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label className="label" htmlFor="client">Client name *</label><input id="client" name="client" className="input" required maxLength={120} /></div>
        <div><label className="label" htmlFor="event">Event / project</label><input id="event" name="event" className="input" maxLength={120} /></div>
      </div>
      <div><label className="label" htmlFor="title">Delivery title *</label><input id="title" name="title" className="input" required maxLength={160} placeholder="Wedding Films" /></div>
      <div><label className="label" htmlFor="message">Message (optional)</label><textarea id="message" name="message" rows={3} maxLength={2000} className="input" placeholder="Your memories are ready." /></div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label className="label" htmlFor="deliveryDate">Delivery date</label><input id="deliveryDate" name="deliveryDate" type="date" defaultValue={today} className="input" /></div>
        <div>
          <label className="label" htmlFor="expiry">Expires</label>
          <select id="expiry" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="input">
            <option value="7">In 7 days</option><option value="15">In 15 days</option><option value="30">In 30 days</option><option value="custom">Custom date</option>
          </select>
        </div>
      </div>
      {expiry === "custom" && (
        <div><label className="label" htmlFor="customDate">Custom expiry date</label><input id="customDate" name="customDate" type="date" min={today} required className="input" /></div>
      )}
      <div><label className="label" htmlFor="password">Password (optional)</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={6} className="input" placeholder="Leave blank for no password" /></div>
      <div className="flex flex-wrap gap-6 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="allowPreviews" defaultChecked className="accent-[#D6AD68]" /> Allow previews</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="allowDownloads" defaultChecked className="accent-[#D6AD68]" /> Allow downloads</label>
      </div>
      <p className="text-xs text-ink-dim">Custom cover image: not implemented yet. Previews and downloads take effect when the client page ships (Stage 4).</p>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      <button disabled={busy} className="btn-gold disabled:opacity-60">{busy ? "Creating…" : "Create delivery & add files"}</button>
    </form>
  );
}
