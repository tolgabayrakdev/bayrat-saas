import { CheckCircle2, CircleAlert } from "lucide-react";

export function FormMessage({ message, type = "error" }: { message?: string; type?: "error" | "success" }) {
  if (!message) return null;
  const Icon = type === "success" ? CheckCircle2 : CircleAlert;

  return (
    <div className={`flex items-start gap-2 text-sm ${type === "success" ? "text-emerald-700" : "text-destructive"}`}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
