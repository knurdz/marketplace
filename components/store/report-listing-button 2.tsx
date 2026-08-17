"use client";

import Link from "next/link";
import { Flag } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createProductReport } from "@/lib/services/report-actions";
import { toast } from "@/lib/ui/toast";

type ReportListingButtonProps = {
  productId: string;
  isLoggedIn: boolean;
  loginHref: string;
};

export function ReportListingButton({
  productId,
  isLoggedIn,
  loginHref,
}: ReportListingButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [pending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <Button variant="ghost" size="sm" asChild className="mt-2 px-0 text-muted-foreground">
        <Link href={loginHref}>
          <Flag className="mr-1.5 size-3.5" aria-hidden />
          Sign in to report listing
        </Link>
      </Button>
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      toast.error("Please provide a reason for your report.");
      return;
    }

    startTransition(async () => {
      const result = await createProductReport({
        productId,
        reason: trimmedReason,
        details: details.trim() || null,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.success ?? "Report submitted.");
      setReason("");
      setDetails("");
      setOpen(false);
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 px-0 text-muted-foreground"
        >
          <Flag className="mr-1.5 size-3.5" aria-hidden />
          Report listing
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Report listing</SheetTitle>
          <SheetDescription>
            Tell us what is wrong with this product. Our team will review your report.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 px-4">
          <div className="space-y-2">
            <label htmlFor="report-reason" className="block text-sm text-muted-foreground">
              Reason
            </label>
            <input
              id="report-reason"
              name="reason"
              type="text"
              required
              maxLength={200}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none ring-accent focus:ring-2"
              placeholder="e.g. Misleading description"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="report-details" className="block text-sm text-muted-foreground">
              Details (optional)
            </label>
            <textarea
              id="report-details"
              name="details"
              rows={5}
              maxLength={2000}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none ring-accent focus:ring-2"
              placeholder="Add any context that helps our team review this listing."
            />
          </div>
          <SheetFooter className="px-0">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Submitting…" : "Submit report"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
