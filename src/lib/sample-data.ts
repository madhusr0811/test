// SAMPLE DATA for Stage 1 UI only. Replaced by database queries in Stage 2.
export type DeliveryStatus = "active" | "expired" | "disabled";

export interface DeliveryRow {
  id: string;
  client: string;
  event: string;
  created: string; // ISO date
  files: number;
  sizeGB: number;
  downloads: number;
  expiry: string; // ISO date
  status: DeliveryStatus;
}

export const sampleDeliveries: DeliveryRow[] = [
  { id: "1", client: "Vishnu & Chandana", event: "Wedding Films", created: "2026-11-25", files: 3, sizeGB: 6.25, downloads: 4, expiry: "2026-12-25", status: "active" },
  { id: "2", client: "Aarav & Meera", event: "Wedding Highlights", created: "2026-11-10", files: 5, sizeGB: 18.4, downloads: 11, expiry: "2026-11-25", status: "active" },
  { id: "3", client: "Nikhil Rao", event: "Corporate Launch", created: "2026-10-02", files: 12, sizeGB: 42.1, downloads: 27, expiry: "2026-11-01", status: "expired" },
  { id: "4", client: "Sana & Imran", event: "Pre-wedding Shoot", created: "2026-09-18", files: 2, sizeGB: 3.1, downloads: 0, expiry: "2026-10-18", status: "disabled" },
];

export const sampleStats = {
  totalDeliveries: sampleDeliveries.length,
  activeLinks: sampleDeliveries.filter((d) => d.status === "active").length,
  totalDownloads: sampleDeliveries.reduce((a, d) => a + d.downloads, 0),
  storageUsedGB: sampleDeliveries.reduce((a, d) => a + d.sizeGB, 0),
  storageTotalGB: 931, // ~1 TB SSD
};
