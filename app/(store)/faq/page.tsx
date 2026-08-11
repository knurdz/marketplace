import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export default function FaqPage() {
  return (
    <LegalPage shell="$ ./help --faq" title="FAQ" updated="11 August 2026">
      <LegalSection title="How do I buy something?">
        <p>
          Browse or search active listings, then check out when Member 2’s cart
          and checkout flows are available. You will choose PayHere, bank
          transfer, or free when the listing price is zero.
        </p>
      </LegalSection>

      <LegalSection title="What payment methods are supported?">
        <p>
          PayHere (sandbox during development), bank transfer with slip upload
          for admin verification, and free checkout for zero-price listings.
        </p>
      </LegalSection>

      <LegalSection title="How do I become a seller?">
        <p>
          Register as a buyer, then apply through the seller portal once Member
          3’s onboarding is live. An admin must approve your seller profile
          before you can publish listings.
        </p>
      </LegalSection>

      <LegalSection title="Why can’t I open /seller or /admin?">
        <p>
          Those areas require the matching role label. Buyers are blocked from
          admin; unapproved users are blocked from seller dashboards. Sign in
          with a seeded demo account if you are testing locally.
        </p>
      </LegalSection>

      <LegalSection title="How does email verification work?">
        <p>
          After sign-up you can request a verification email from your account
          page. Password reset uses a secure recovery link. Sensitive auth
          actions are rate-limited to reduce abuse.
        </p>
      </LegalSection>

      <LegalSection title="Where do notifications appear?">
        <p>
          Signed-in users see a bell in the storefront and portal headers.
          Unread items poll about every 45 seconds during MVP (realtime later).
        </p>
      </LegalSection>
    </LegalPage>
  );
}
