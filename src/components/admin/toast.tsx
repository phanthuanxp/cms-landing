import { cn } from "@/lib/utils";

export function AdminToast({
  type,
  message
}: {
  type?: "success" | "error";
  message?: string;
}) {
  if (!type || !message) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 max-w-sm">
      <div
        className={cn(
          "rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur",
          type === "success"
            ? "border-teal-200 bg-teal-50/95 text-teal-900"
            : "border-red-200 bg-red-50/95 text-red-800"
        )}
      >
        {message.replace(/-/g, " ")}
      </div>
    </div>
  );
}
