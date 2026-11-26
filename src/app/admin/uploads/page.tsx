import { UploadSessionsList, type SessionRow } from "@/components/UploadSessionsList";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function Uploads() {
  const rows = getDb().prepare(
    `SELECT u.id, u.filename, u.size, u.status, u.total_chunks AS totalChunks, u.updated_at AS updatedAt, d.client, d.title,
            (SELECT COUNT(*) FROM upload_chunks c WHERE c.session_id = u.id) AS receivedChunks
     FROM upload_sessions u JOIN deliveries d ON d.id = u.delivery_id ORDER BY u.updated_at DESC LIMIT 100`,
  ).all() as SessionRow[];
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl">Uploads</h1>
      <p className="text-sm text-ink-dim">Start new uploads from a delivery page. Incomplete uploads can be resumed there by choosing the same file again; abandoned ones are removed after 48 hours.</p>
      <UploadSessionsList rows={rows} />
    </div>
  );
}
