import Link from "next/link";
import { Bottle } from "@/components/brand/bottle";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="gloss grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <Link href="/">
          <Logo />
        </Link>
        <Bottle category="serum" seed="404" className="mx-auto mt-10 h-24 rotate-12" flag="clash" />
        <h1 className="mt-6 text-[36px] font-semibold">This page isn't on the shelf</h1>
        <p className="mt-2 text-muted">The link may be old or mistyped.</p>
        <Link href="/">
          <Button className="mt-6">Back to Skinmatch</Button>
        </Link>
      </div>
    </div>
  );
}
