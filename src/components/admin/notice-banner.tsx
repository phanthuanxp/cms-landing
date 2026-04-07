export function NoticeBanner({
  type,
  message
}: {
  type: "success" | "error";
  message?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={
        type === "success"
          ? "rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800"
          : "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      }
    >
      {message.replace(/-/g, " ")}
    </div>
  );
}
