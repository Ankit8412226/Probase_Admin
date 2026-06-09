import { cn } from "@/lib/utils";

const tones = {
  neutral: "border-line bg-mist text-black",
  success: "border-black/10 bg-black text-white",
  warning: "border-black/10 bg-black/85 text-white",
  danger: "border-red-200 bg-red-50 text-red-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
  alert: "border-amber-200 bg-amber-50 text-amber-700",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
