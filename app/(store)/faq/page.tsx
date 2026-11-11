import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export default function FaqPage() {
  return (
    <LegalPage title="FAQ" updated="10 November 2026">
      <LegalSection title="How do I buy something?">
        <p>
          Browse or search active listings, open a product, choose a quantity,
          and tap Buy. That sends a request to the seller and shows their phone
          and email so you can arrange the sale directly.
        </p>
      </LegalSection>

      <LegalSection title="Does Knurdz process payments?">
        <p>
          No. Buyers and sellers contact each other and settle personally. When
          the deal is done, the seller marks the request sold or cancelled.
          Stock drops only when a request is marked sold.
        </p>
      </LegalSection>

      <LegalSection title="How do I sell on Knurdz?">
        <p>
          Create an account and choose Seller at registration. An admin reviews
          your shop before you can publish listings. Add a phone number so
          buyers can reach you after they send a request.
        </p>
      </LegalSection>

      <LegalSection title="Why can’t I open /seller or /admin?">
        <p>
          Those areas require the matching role label. Buyers are blocked from
          admin; unapproved users are blocked from seller dashboards. Sign in
          with a seeded demo account if you are testing locally.
        </p>
      </LegalSection>

      <LegalSection title="How do seller reviews work?">
        <p>
          After a seller marks your request sold, you can rate the seller from
          that request. An admin must approve the review before it appears on
          the seller’s shop. Reviews are about the seller, not a product.
        </p>
      </LegalSection>

      <LegalSection title="How does email verification work?">
        <p>
          After sign-up you can request a verification email from your account
          page. Password reset uses a secure recovery link. Sensitive auth
          actions are rate-limited.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
