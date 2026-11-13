"use client";

import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  unbanShop,
  type SellerApprovalActionState,
} from "@/lib/backend/seller-approval-actions";
import { toast } from "@/lib/ui/toast";

const initialState: SellerApprovalActionState = {};

type SellerUnbanShopButtonProps = {
  sellerProfileId: string;
  shopName: string;
};

export function SellerUnbanShopButton({
  sellerProfileId,
  shopName,
}: SellerUnbanShopButtonProps) {
  const [state, formAction, pending] = useActionState(unbanShop, initialState);
  const lastToast = useRef<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.error) {
      const key = `e:${state.error}`;
      if (key !== lastToast.current) {
        lastToast.current = key;
        toast.error(state.error);
      }
      return;
    }
    if (state.success) {
      const key = `s:${state.success}`;
      if (key !== lastToast.current) {
        lastToast.current = key;
        toast.success(state.success);
        router.refresh();
      }
    }
  }, [state, router]);

  return (
    <form action={formAction}>
      <input type="hidden" name="sellerProfileId" value={sellerProfileId} />
      <Button
        type="submit"
        variant="success"
        size="sm"
        disabled={pending}
        data-testid="admin-unban-shop"
      >
        <ShieldCheck data-icon="inline-start" />
        {pending ? "Unbanning…" : `Unban ${shopName}`}
      </Button>
    </form>
  );
}
