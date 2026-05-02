import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <section className={cn("surface p-5", className)}>{children}</section>;
}

export function CardHeader({
  eyebrow,
  title,
  description,
  invert = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  invert?: boolean;
}) {
  return (
    <div className="space-y-1">
      {eyebrow ? (
        <p
          className={cn(
            "font-mono text-[11px] uppercase tracking-[0.2em]",
            invert ? "text-white/60" : "text-fog",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <div>
        <h3 className={cn("text-lg font-semibold", invert ? "text-white" : "text-ink")}>
          {title}
        </h3>
        {description ? (
          <p className={cn("text-sm", invert ? "text-white/70" : "text-fog")}>{description}</p>
        ) : null}
      </div>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-black to-black/30" />
      <p className="text-sm text-fog">{label}</p>
      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        <span className="rounded-full border border-line bg-mist px-3 py-1 text-xs font-medium text-fog">
          {delta}
        </span>
      </div>
    </Card>
  );
}
