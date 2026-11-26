import Link from "next/link";
import { Link2 } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function Access() {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-md text-center">
        <Logo />
        <div className="card mt-10 p-8">
          <Link2 className="mx-auto h-6 w-6 text-gold" />
          <h1 className="mt-4 font-serif text-3xl">Open your private link</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-dim">
            Your files are available at the private link your studio sent you. Open that link
            directly in your browser — there is nothing to sign up for.
          </p>
        </div>
        <Link href="/" className="mt-6 inline-block text-sm text-ink-dim hover:text-gold-soft">← Back to home</Link>
      </div>
    </main>
  );
}
