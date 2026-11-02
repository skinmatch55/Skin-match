"use client";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-[70dvh] place-items-center px-4 text-center">
      <div>
        <h1 className="text-[32px] font-semibold">Something went wrong on our side</h1>
        <p className="mt-2 text-muted">Your routine and products are safe. Try again in a moment.</p>
        <Button className="mt-6" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
