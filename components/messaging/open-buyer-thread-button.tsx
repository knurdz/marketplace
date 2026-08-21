import { Button } from "@/components/ui/button";
import { openBuyerThreadFormAction } from "@/lib/services/message-actions";

type OpenBuyerThreadButtonProps = {
  orderId: string;
};

export function OpenBuyerThreadButton({ orderId }: OpenBuyerThreadButtonProps) {
  return (
    <form action={openBuyerThreadFormAction}>
      <input type="hidden" name="orderId" value={orderId} />
      <Button type="submit" variant="outline" size="sm">
        Message seller
      </Button>
    </form>
  );
}
