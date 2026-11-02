"use client";
import { ArrowDot, Button, type ButtonProps } from "@/components/ui/button";

/** Every main button leads to the hero's input. */
export function ScrollToTry({ children = "Check my routine", ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      onClick={() => {
        const el = document.getElementById("try");
        if (!el) return (location.href = "/#try");
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => el.querySelector<HTMLInputElement>("input[role=combobox]")?.focus({ preventScroll: true }), 600);
      }}
    >
      {children}
      {props.size === "sm" ? null : <ArrowDot nudge />}
    </Button>
  );
}
