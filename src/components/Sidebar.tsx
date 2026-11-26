"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Send, UploadCloud, HardDrive, Activity, Settings, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/deliveries", label: "Deliveries", icon: Send },
  { href: "/admin/uploads", label: "Uploads", icon: UploadCloud },
  { href: "/admin/storage", label: "Storage", icon: HardDrive },
  { href: "/admin/activity", label: "Activity", icon: Activity },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              active ? "bg-gold/10 text-gold-soft" : "text-ink-dim hover:bg-surface2 hover:text-ink"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </Link>
        );
      })}
      <button onClick={logout} className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-ink-dim hover:bg-surface2 hover:text-ink">
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo href="/admin" />
        <button aria-label="Toggle menu" onClick={() => setOpen((o) => !o)} className="text-ink-dim">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <aside
        className={`${open ? "flex" : "hidden"} fixed inset-x-0 top-[57px] bottom-0 z-20 flex-col gap-6 bg-bg py-4 lg:static lg:flex lg:w-60 lg:shrink-0 lg:border-r lg:border-line lg:py-6`}
      >
        <div className="hidden px-5 lg:block"><Logo href="/admin" /></div>
        {nav}
      </aside>
    </>
  );
}
