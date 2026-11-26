import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Notice } from "@/components/Notice";
import { LoginForm } from "@/components/LoginForm";
import { getAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";

export const metadata = { title: "Admin Login — TestTranfer" };
export const dynamic = "force-dynamic";

export default function Login() {
  if (getAdmin()) redirect("/admin");
  const hasAdmin = (getDb().prepare("SELECT COUNT(*) AS c FROM admins").get() as { c: number }).c > 0;
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center"><Logo /></div>
        <div className="card p-7">
          <h1 className="font-serif text-3xl">Admin sign in</h1>
          {hasAdmin ? (
            <LoginForm />
          ) : (
            <div className="mt-5">
              <Notice>
                No administrator exists yet. Set <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD</code> (12+ characters)
                in the server environment and restart. The account is created on startup.
              </Notice>
            </div>
          )}
        </div>
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-ink-dim hover:text-gold-soft">← Back to home</Link>
        </p>
      </div>
    </main>
  );
}
