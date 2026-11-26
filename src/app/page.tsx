import Link from "next/link";
import { ShieldCheck, Film, UserX, Zap, Timer, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";

const features = [
  { icon: ShieldCheck, title: "Secure private delivery", text: "Every delivery has its own unguessable link, with optional password protection." },
  { icon: Film, title: "Original quality downloads", text: "Receive your films and photos exactly as they were delivered — no recompression." },
  { icon: UserX, title: "No account required", text: "Open your link and download. Nothing to sign up for." },
  { icon: Zap, title: "Fast and simple access", text: "A clean page, clear file list and one-click downloads on any device." },
  { icon: Timer, title: "Expiring delivery links", text: "Links expire automatically, keeping your private memories private." },
];

const steps = [
  { n: "01", title: "Receive your link", text: "Your studio sends you a private delivery link." },
  { n: "02", title: "Preview your films", text: "Watch previews right in the browser, if enabled." },
  { n: "03", title: "Download originals", text: "Save the full-quality files before the link expires." },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-ink-dim sm:flex">
          <a href="#features" className="hover:text-ink">Features</a>
          <a href="#how" className="hover:text-ink">How it works</a>
          <Link href="/access" className="hover:text-ink">Access files</Link>
        </nav>
        <Link href="/login" className="btn-ghost !py-2">Admin Login</Link>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_at_top,#D6AD6822,transparent_65%)]" />
          <div className="relative mx-auto max-w-4xl px-5 pb-24 pt-20 text-center sm:pt-28">
            <p className="mb-5 text-xs uppercase tracking-[0.3em] text-gold">Private file delivery</p>
            <h1 className="font-serif text-5xl leading-[1.05] sm:text-7xl">Your files. Delivered beautifully.</h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-ink-dim">
              A simple and secure way to receive your photos, films and creative work.
            </p>
            <div className="mt-10">
              <Link href="/access" className="btn-gold px-7 py-3">
                Access Your Files <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="card p-6 transition-colors hover:border-gold/40">
                <Icon className="h-5 w-5 text-gold" />
                <h3 className="mt-4 font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-dim">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-center font-serif text-4xl">How it works</h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n}>
                <div className="font-serif text-4xl text-gold/70">{s.n}</div>
                <h3 className="mt-3 font-medium">{s.title}</h3>
                <p className="mt-2 text-sm text-ink-dim">{s.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-16 border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-ink-dim sm:flex-row">
          <Logo />
          <span>© {new Date().getFullYear()} TestTranfer. All rights reserved.</span>
          <Link href="/login" className="hover:text-gold-soft">Admin Login</Link>
        </div>
      </footer>
    </div>
  );
}
