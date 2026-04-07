"use client";

import { useState } from "react";
import { CheckCircle2, SendHorizonal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm({
  tenantId,
  pageId,
  sourcePath
}: {
  tenantId: string;
  pageId?: string;
  sourcePath: string;
}) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [pending, setPending] = useState(false);
  const [startedAt] = useState(() => Date.now());

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          tenantId,
          pageId,
          sourcePath,
          sourceHost: typeof window !== "undefined" ? window.location.host : undefined,
          honeypot: formData.get("website"),
          startedAt,
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          company: formData.get("company"),
          message: formData.get("message")
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });

      setStatus(response.ok ? "success" : "error");
    } catch {
      setStatus("error");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="grid gap-5 rounded-[2.1rem] border border-stone-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(251,249,245,0.92))] p-6 shadow-[0_20px_44px_rgba(28,25,23,0.06)] sm:p-7">
      <div aria-hidden="true" className="hidden">
        <Label htmlFor="contact-website">Website</Label>
        <Input autoComplete="off" id="contact-website" name="website" tabIndex={-1} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-stone-700" htmlFor="contact-name">Ho va ten</Label>
          <Input className="h-12 rounded-2xl border-stone-200 bg-white" id="contact-name" name="name" placeholder="Nguyen Van A" required />
        </div>
        <div className="space-y-2">
          <Label className="text-stone-700" htmlFor="contact-phone">So dien thoai</Label>
          <Input className="h-12 rounded-2xl border-stone-200 bg-white" id="contact-phone" name="phone" placeholder="0901 234 567" required />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-stone-700" htmlFor="contact-email">Email</Label>
          <Input className="h-12 rounded-2xl border-stone-200 bg-white" id="contact-email" name="email" placeholder="you@example.com" type="email" />
        </div>
        <div className="space-y-2">
          <Label className="text-stone-700" htmlFor="contact-company">Cong ty</Label>
          <Input className="h-12 rounded-2xl border-stone-200 bg-white" id="contact-company" name="company" placeholder="Cong ty ABC" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-stone-700" htmlFor="contact-message">Nhu cau</Label>
        <Textarea className="min-h-36 rounded-[1.6rem] border-stone-200 bg-white px-4 py-3" id="contact-message" name="message" placeholder="Mo ta ngan gon nhu cau, muc tieu SEO, landing page hoac noi dung blog..." rows={5} />
      </div>
      <div className="flex flex-col gap-4 rounded-[1.7rem] border border-stone-200/80 bg-stone-50/90 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="flex items-center gap-2 text-sm text-stone-600" role="status">
          {status === "success" ? <CheckCircle2 className="h-4 w-4 text-teal-600" /> : null}
          {status === "success" && "Thong tin da duoc gui thanh cong."}
          {status === "error" && "Gui form that bai, vui long thu lai."}
          {status === "idle" && "Thong tin duoc luu truc tiep vao lead database va scope theo tenant hien tai."}
        </p>
        <Button className="rounded-xl px-5" type="submit" disabled={pending}>
          {pending ? "Dang gui..." : "Gui yeu cau"}
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
