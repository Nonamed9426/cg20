import Image from 'next/image';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="relative h-10 w-20 overflow-hidden rounded-xl border border-white/10 bg-transparent p-1 shadow-neon">
        <Image src="/company-logo.png" alt="company logo" fill className="object-contain" sizes="80px" priority />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-[0.25em] text-white/95">CG20</div>
        <div className="text-[10px] uppercase tracking-[0.38em] text-white/45">Steam Insight</div>
      </div>
    </Link>
  );
}
