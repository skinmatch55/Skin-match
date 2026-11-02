"use client";
import { useConfig } from "@/components/config";
import { TryFlow } from "@/components/funnel/try-flow";

export function HeroTry() {
  const cfg = useConfig();
  return <TryFlow aiEnabled={cfg.ai} signedIn={false} />;
}
