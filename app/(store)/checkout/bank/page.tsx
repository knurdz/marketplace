import { notFound, redirect } from "next/navigation";
import { BankSlipUploadForm } from "@/components/store/bank-slip-upload-form";
import { getLoggedInUser } from "@/lib/appwrite/session";
import { PLATFORM_SETTING_KEYS } from "@/lib/platform-settings/keys";
import { getOwnOrder, getOwnPaymentForOrder } from "@/lib/services/orders";
import { getPlatformSetting } from "@/lib/services/platform-settings";
import { getSellerBankDetailsForCheckout } from "@/lib/services/sellers";

type CheckoutContinuationPageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function CheckoutBankPage({
  searchParams,
}: CheckoutContinuationPageProps) {
  const { orderId } = await searchParams;
  const user = await getLoggedInUser();
  if (!user) {
    const next = orderId?.trim()
      ? `/checkout/bank?orderId=${encodeURIComponent(orderId.trim())}`
      : "/checkout/bank";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  if (!orderId?.trim()) notFound();

  const order = await getOwnOrder(orderId);
  if (!order || order.paymentMethod !== "bank_transfer") notFound();

  const payment = await getOwnPaymentForOrder(orderId);
  if (!payment || payment.method !== "bank_transfer") notFound();

  const canShowSellerBank =
    payment.status === "pending" || payment.status === "awaiting_verification";

  const [bankInstructionsSetting, sellerBank] = await Promise.all([
    getPlatformSetting(PLATFORM_SETTING_KEYS.checkoutBankInstructions),
    canShowSellerBank
      ? getSellerBankDetailsForCheckout(order.$id)
      : Promise.resolve(null),
  ]);

  const bankInstructions =
    bankInstructionsSetting?.value?.trim() ||
    "Transfer the order total to the seller bank account below, then upload your payment slip for admin verification.";

  return (
    <main className="relative mx-auto w-full max-w-3xl px-6 py-16 sm:px-10">
      <p className="font-mono text-sm text-accent">$ ./checkout --bank</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        Bank transfer instructions
      </h1>
      <p className="mt-4 text-muted-foreground">
        Order <span className="font-mono text-foreground">{order.$id}</span> ·
        Amount due: {order.currency} {order.totalAmount.toFixed(2)}
      </p>

      <section className="mt-10 space-y-4">
        <p className="font-mono text-sm text-accent">$ ./checkout --instructions</p>
        <h2 className="text-xl font-bold tracking-tight">How to pay</h2>
        <p className="text-muted-foreground whitespace-pre-wrap">
          {bankInstructions}
        </p>
      </section>

      {canShowSellerBank ? (
        sellerBank &&
        (sellerBank.bankAccountName ||
          sellerBank.bankAccountNumber ||
          sellerBank.bankName) ? (
          <section className="mt-10 space-y-3">
            <p className="font-mono text-sm text-accent">$ ./checkout --seller-bank</p>
            <h2 className="text-xl font-bold tracking-tight">Seller bank details</h2>
            <dl className="space-y-2 text-sm">
              {sellerBank.bankName ? (
                <div>
                  <dt className="text-muted-foreground">Bank</dt>
                  <dd className="font-medium">{sellerBank.bankName}</dd>
                </div>
              ) : null}
              {sellerBank.bankAccountName ? (
                <div>
                  <dt className="text-muted-foreground">Account name</dt>
                  <dd className="font-medium">{sellerBank.bankAccountName}</dd>
                </div>
              ) : null}
              {sellerBank.bankAccountNumber ? (
                <div>
                  <dt className="text-muted-foreground">Account number</dt>
                  <dd className="font-mono font-medium">
                    {sellerBank.bankAccountNumber}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>
        ) : (
          <p className="mt-10 text-sm text-muted-foreground" role="status">
            Seller bank details are not available yet. Contact support if you need
            help completing this transfer.
          </p>
        )
      ) : (
        <p className="mt-10 text-sm text-muted-foreground" role="status">
          Bank details are only shown while this transfer is awaiting payment.
        </p>
      )}

      <BankSlipUploadForm order={order} payment={payment} />
    </main>
  );
}
