import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[transform,background-color,box-shadow,color] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-ink text-cream shadow-[0_8px_20px_-8px_rgb(42_29_26/0.55)] hover:bg-ink-2",
        lime: "bg-lime text-ink hover:brightness-95 shadow-[0_8px_20px_-10px_rgb(143_191_18/0.8)]",
        outline: "border border-line bg-surface text-ink hover:bg-blush-2",
        ghost: "text-ink hover:bg-blush-2",
        soft: "bg-blush text-ink hover:bg-nude/70",
        danger: "bg-clash text-white hover:brightness-95",
        google: "border border-line bg-white text-ink hover:bg-[#f8f6f5] shadow-sm",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-[15px]",
        lg: "h-14 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, ...props },
  ref,
) {
  return <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});

/** The dot-arrow that sits at the end of every main button. */
export function ArrowDot({ nudge = false, className }: { nudge?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "-mr-2 ml-1 grid h-8 w-8 place-items-center rounded-full bg-lime text-ink",
        nudge && "animate-nudge",
        className,
      )}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
