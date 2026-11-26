import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-lg border border-gold/50 font-serif text-lg text-gold">T</span>
      <span className="font-serif text-xl tracking-wide text-ink">TestTranfer</span>
    </Link>
  );
}
