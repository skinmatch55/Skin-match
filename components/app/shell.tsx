"use client";
import { CircleUser, FlaskConical, ListOrdered, NotebookPen, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/routine", label: "Routine", I: ListOrdered },
  { href: "/products", label: "Products", I: FlaskConical },
  { href: "/conflicts", label: "Conflicts", I: ShieldAlert },
  { href: "/diary", label: "Diary", I: NotebookPen },
  { href: "/account", label: "Account", I: CircleUser },
];

export function AppShell({ email, planName, children }: { email: string; planName: string | null; children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-white/60 px-4 py-6 md:flex">
        <Link href="/routine" className="px-2">
          <Logo />
        </Link>
        <nav className="mt-8 space-y-1">
          {NAV.map(({ href, label, I }) => {
            const on = path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] font-medium transition",
                  on ? "bg-ink text-cream" : "text-ink-2 hover:bg-blush-2",
                )}
              >
                <I className={cn("h-5 w-5", on && "text-lime")} /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-line bg-cream p-3">
          <p className="truncate text-[13px] font-medium">{email}</p>
          <p className="text-[12px] text-muted">{planName ? `${planName} plan` : "No plan yet"}</p>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line/60 bg-cream/80 px-4 backdrop-blur-xl md:hidden">
          <Link href="/routine">
            <Logo />
          </Link>
          {planName && <span className="rounded-full bg-lime px-2.5 py-1 text-[12px] font-bold">{planName}</span>}
        </header>
        <main className="mx-auto max-w-[1000px] px-4 pb-32 pt-6 md:px-8 md:pb-16 md:pt-10">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <ul className="grid grid-cols-5">
          {NAV.map(({ href, label, I }) => {
            const on = path.startsWith(href);
            return (
              <li key={href}>
                <Link href={href} className={cn("flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium", on ? "text-ink" : "text-muted")}>
                  <span className={cn("grid h-8 w-12 place-items-center rounded-full transition", on && "bg-ink text-lime")}>
                    <I className="h-5 w-5" />
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
