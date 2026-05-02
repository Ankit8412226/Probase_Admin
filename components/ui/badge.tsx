import { cn } from "@/lib/utils";

const tones = {
  neutral: "border-line bg-mist text-black",
  success: "border-black/10 bg-black text-white",
  warning: "border-black/10 bg-black/85 text-white",
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
