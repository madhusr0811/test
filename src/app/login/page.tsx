import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Notice } from "@/components/Notice";

export const metadata = { title: "Admin Login — TestTranfer" };

export default function Login() {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center"><Logo /></div>
        <div className="card p-7">
          <h1 className="font-serif text-3xl">Admin sign in</h1>
          <form className="mt-6 space-y-4" action="#" method="post">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" name="email" type="email" autoComplete="username" className="input" required />
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" className="input" required />
            </div>
            <button type="button" disabled className="btn-gold w-full opacity-50">Sign in</button>
          </form>
          <div className="mt-5">
            <Notice>Not implemented yet: authentication (password hashing, sessions, rate limiting) is Stage 2. Sign-in is disabled until then.</Notice>
          </div>
        </div>
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-ink-dim hover:text-gold-soft">← Back to home</Link>
        </p>
      </div>
    </main>
  );
}
