import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm shadow-indigo-500/20",
  secondary: "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white",
  ghost: "bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-100",
  danger: "bg-rose-600/10 text-rose-400 border border-rose-500/25 hover:bg-rose-600 hover:text-white",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "subtle-ring inline-flex h-11 items-center justify-center gap-2 rounded-[14px] px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
