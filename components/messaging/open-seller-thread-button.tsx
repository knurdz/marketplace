import { Button } from "@/components/ui/button";
import { openSellerThreadFormAction } from "@/lib/services/message-actions";

type OpenSellerThreadButtonProps = {
  orderId: string;
};

export function OpenSellerThreadButton({
  orderId,
}: OpenSellerThreadButtonProps) {
  return (
    <form action={openSellerThreadFormAction}>
      <input type="hidden" name="orderId" value={orderId} />
      <Button type="submit" variant="outline" size="sm">
        Message buyer
      </Button>
    </form>
  );
}
