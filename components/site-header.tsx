import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ScrollToTry } from "@/components/landing/scroll-to-try";

export function SiteHeader({ cta = true }: { cta?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-cream/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-4 md:px-6">
        <Link href="/" aria-label="Skinmatch home">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1.5">
          <Link href="/login" className="rounded-full px-3 py-2 text-[15px] font-medium text-ink hover:bg-blush-2">
            Log in
          </Link>
          {cta && (
            <ScrollToTry size="sm" className="hidden sm:inline-flex">
              Check my routine
            </ScrollToTry>
          )}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <Logo />
          <p className="mt-2 text-[14px] text-muted">Your skincare routine, checked by AI.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-muted">
          <Link href="/terms" className="hover:text-ink">Terms</Link>
          <Link href="/privacy" className="hover:text-ink">Privacy</Link>
          <Link href="/login" className="hover:text-ink">Log in</Link>
          <span>© {new Date().getFullYear()} Skinmatch</span>
        </nav>
      </div>
      <p className="mx-auto max-w-[1120px] px-4 pb-8 text-[12px] text-muted/80 md:px-6">
        Skinmatch gives general skincare guidance, not medical advice. For prescriptions or skin conditions, follow your dermatologist.
      </p>
    </footer>
  );
}
