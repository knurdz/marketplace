"use client";

import { useEffect, useRef } from "react";
import { toast } from "@/lib/ui/toast";

type VerifyEmailToastProps = {
  status: "success" | "error" | null;
  message: string;
};

/** One-shot toast after opening an email verification link (server decides status). */
export function VerifyEmailToast({ status, message }: VerifyEmailToastProps) {
  const shown = useRef(false);

  useEffect(() => {
    if (!status || !message.trim() || shown.current) return;
    shown.current = true;
    if (status === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  }, [status, message]);

  return null;
}
