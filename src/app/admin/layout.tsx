import { Sidebar } from "@/components/Sidebar";

export const metadata = { title: "Admin — TestTranfer" };

// NOTE: route protection is added in Stage 2 (middleware + session check).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <main className="min-w-0 flex-1 px-5 py-8 lg:px-10">{children}</main>
    </div>
  );
}
