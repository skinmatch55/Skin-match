"use client";

import { AnimatePresence, motion, useDragControls } from "framer-motion";
import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

function useIsDesktop() {
  const [d, setD] = React.useState(false);
  React.useEffect(() => {
    const m = window.matchMedia("(min-width: 768px)");
    const on = () => setD(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return d;
}

/**
 * Sheet with spring physics.
 * - variant "full": full screen on a phone, a centered card on a computer (paywall).
 * - variant "bottom": bottom sheet with a grab handle on a phone, a centered card on a computer.
 */
export function Sheet({
  open,
  onClose,
  label,
  variant = "bottom",
  width = 480,
  children,
  className,
  z = 50,
  dismissible = true,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  variant?: "full" | "bottom";
  width?: number;
  children: React.ReactNode;
  className?: string;
  z?: number;
  dismissible?: boolean;
}) {
  const desktop = useIsDesktop();
  const drag = useDragControls();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, dismissible]);

  if (!mounted) return null;
  const full = variant === "full" && !desktop;
  const bottom = variant === "bottom" && !desktop;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0" style={{ zIndex: z }} role="dialog" aria-modal="true" aria-label={label}>
          <motion.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => dismissible && onClose()}
          />
          <div
            className={cn(
              "pointer-events-none absolute inset-0 flex",
              desktop ? "items-center justify-center p-6" : full ? "items-stretch" : "items-end",
            )}
          >
            <motion.div
              className={cn(
                "pointer-events-auto relative flex w-full flex-col overflow-hidden bg-cream shadow-[var(--shadow-lift)]",
                desktop && "max-h-[min(92dvh,900px)] rounded-[28px]",
                full && "h-dvh",
                bottom && "max-h-[94dvh] rounded-t-[28px]",
                className,
              )}
              style={desktop ? { maxWidth: width } : undefined}
              initial={desktop ? { opacity: 0, y: 24, scale: 0.98 } : { y: "100%" }}
              animate={desktop ? { opacity: 1, y: 0, scale: 1 } : { y: 0 }}
              exit={desktop ? { opacity: 0, y: 16, scale: 0.98 } : { y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 340, mass: 0.9 }}
              drag={bottom && dismissible ? "y" : false}
              dragControls={drag}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120 || info.velocity.y > 600) onClose();
              }}
            >
              {bottom && (
                <div
                  className="flex shrink-0 cursor-grab touch-none justify-center pb-1 pt-3 active:cursor-grabbing"
                  onPointerDown={(e) => drag.start(e)}
                >
                  <span className="h-1.5 w-11 rounded-full bg-ink/15" />
                </div>
              )}
              {children}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
