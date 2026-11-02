import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { KwopFlow } from "@/components/kwop-flow";

export function AuthCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="gloss flex min-h-dvh flex-col items-center px-4 py-8">
      <KwopFlow />
      <Link href="/" aria-label="Skinmatch home">
        <Logo />
      </Link>
      <div className="mt-8 w-full max-w-[420px] rounded-[28px] border border-white bg-white/85 p-6 shadow-[var(--shadow-lift)] backdrop-blur md:mt-14 md:p-8">
        <h1 className="font-serif text-[30px] font-semibold leading-tight">{title}</h1>
        {sub && <p className="mb-6 mt-1.5 text-[15px] text-muted">{sub}</p>}
        {children}
      </div>
    </div>
  );
}
