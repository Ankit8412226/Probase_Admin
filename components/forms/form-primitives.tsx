import { cn } from "@/lib/utils";

export function FieldLabel({
  htmlFor,
  children,
  className,
}: {
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={cn("text-sm font-semibold text-black", className)}>
      {children}
    </label>
  );
}

export function TextInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "subtle-ring h-11 w-full rounded-[14px] border border-line bg-white px-4 text-sm text-black placeholder:text-fog",
        className,
      )}
    />
  );
}

export function SelectInput({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "subtle-ring h-11 w-full rounded-[14px] border border-line bg-white px-4 text-sm text-black",
        className,
      )}
    >
      {children}
    </select>
  );
}

export function TextArea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "subtle-ring min-h-[120px] w-full rounded-[14px] border border-line bg-white px-4 py-3 text-sm text-black placeholder:text-fog",
        className,
      )}
    />
  );
}

export function FormGrid({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

export function FieldGroup({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="space-y-2">{children}</div>;
}
