import { cn } from "@/lib/utils";

/** Skinmatch mark: two drops that meet, one blush, one lime. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8", className)} aria-hidden>
      <rect width="32" height="32" rx="10" fill="#2A1D1A" />
      <path d="M12.5 7.5c2.6 3.4 5 6.4 5 9.6a5 5 0 0 1-10 0c0-3.2 2.4-6.2 5-9.6Z" fill="#F6E4DD" />
      <path d="M20 12c2.3 3 4.4 5.6 4.4 8.4a4.4 4.4 0 0 1-8.8 0c0-2.8 2.1-5.4 4.4-8.4Z" fill="#C8FF3D" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="font-serif text-[21px] font-semibold tracking-[-0.02em] text-ink">Skinmatch</span>
    </span>
  );
}
