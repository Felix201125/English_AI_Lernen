import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success";

const styles: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-95 shadow-lg shadow-indigo-500/25",
  secondary:
    "bg-white/5 text-white border border-white/10 hover:bg-white/10",
  ghost: "bg-transparent text-slate-200 hover:bg-white/5",
  danger: "bg-rose-500/90 text-white hover:bg-rose-500",
  success: "bg-emerald-500 text-white hover:bg-emerald-400",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: "sm" | "md" | "lg";
  }
>(function Button(
  { className, variant = "primary", size = "md", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2.5 text-sm",
        size === "lg" && "px-5 py-3 text-base",
        styles[variant],
        className
      )}
      {...props}
    />
  );
});
