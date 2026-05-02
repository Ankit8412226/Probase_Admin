import { CircleOff } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="surface flex min-h-72 flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 rounded-full border border-line bg-mist p-4">
        <CircleOff className="text-fog" size={20} />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-fog">{description}</p>
    </div>
  );
}
