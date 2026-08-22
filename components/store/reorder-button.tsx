"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { reorderOrderAction } from "@/lib/services/order-actions";
import { toast } from "@/lib/ui/toast";

type ReorderButtonProps = {
  orderId: string;
  /** Compact row action vs detail page button. */
  variant?: "row" | "detail";
};

export function ReorderButton({
  orderId,
  variant = "detail",
}: ReorderButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleReorder() {
    startTransition(async () => {
      const result = await reorderOrderAction(orderId);
      if (result.ok) {
        toast.success(result.message ?? "Added to cart.");
        router.push("/cart");
        return;
      }
      toast.error(result.error ?? "Could not reorder.");
    });
  }

  if (variant === "row") {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-auto px-0 py-0 font-mono text-xs text-accent hover:bg-transparent"
        disabled={pending}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleReorder();
        }}
        data-testid={`reorder-${orderId}`}
      >
        {pending ? "Adding…" : "Reorder"}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        type="button"
        size="sm"
        disabled={pending}
        onClick={handleReorder}
        data-testid={`reorder-${orderId}`}
      >
        {pending ? "Adding to cart…" : "Reorder"}
      </Button>
      <Button variant="outline" size="sm" asChild>
        <Link href="/cart">View cart</Link>
      </Button>
    </div>
  );
}
