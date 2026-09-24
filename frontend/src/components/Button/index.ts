import type { ButtonHTMLAttributes } from "react";

export type Variant = "primary" | "secondary" | "ghost" | "danger";
export type Size = "sm" | "md";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export const base =
  "inline-flex items-center justify-center gap-2 rounded-sm font-sans font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50";

export const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-accent active:bg-accent-dark",
  secondary: "border border-rule text-ink hover:border-ink",
  ghost: "text-ink-soft hover:text-ink",
  danger: "border border-error/30 text-error hover:border-error hover:bg-error-bg",
};

export const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-[15px]",
};
