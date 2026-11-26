import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { getAdmin } from "@/lib/auth";

export const metadata = { title: "Admin — TestTranfer" };
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!getAdmin()) redirect("/login");
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <main className="min-w-0 flex-1 px-5 py-8 lg:px-10">{children}</main>
    </div>
  );
}
