import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      updated="11 August 2026"
    >
      <LegalSection title="1. Agreement">
        <p>
          By creating an account or using Knurdz Marketplace (“Knurdz”), you
          agree to these Terms. If you do not agree, do not use the service.
        </p>
      </LegalSection>

      <LegalSection title="2. Roles">
        <p>
          Users register as a buyer or a seller. Sellers wait for admin
          approval before opening a shop. Admins are created by the team in
          Appwrite. Access to seller and admin areas is restricted by role
          labels enforced on the server.
        </p>
      </LegalSection>

      <LegalSection title="3. Listings and orders">
        <p>
          Sellers are responsible for accurate listing details, stock, and
          fulfillment. Buyers are responsible for providing correct checkout
          information. Knurdz provides the platform; sellers fulfill their own
          orders unless otherwise stated.
        </p>
      </LegalSection>

      <LegalSection title="4. Payments">
        <p>
          Checkout may use PayHere (sandbox in development), bank transfer with
          slip verification, or free listings when price is zero. Payment status
          is confirmed through trusted server flows — return URLs alone are not
          proof of payment.
        </p>
      </LegalSection>

      <LegalSection title="5. Acceptable use">
        <p>
          Do not misuse the platform: no fraud, illegal goods, harassment,
          scraping that harms the service, or attempts to bypass access
          controls. We may suspend accounts that violate these Terms.
        </p>
      </LegalSection>

      <LegalSection title="6. Limitation of liability">
        <p>
          To the fullest extent permitted by law, Knurdz and its operators are
          not liable for indirect or consequential losses arising from use of
          the marketplace, including disputes between buyers and sellers. The
          service is provided “as is” during MVP.
        </p>
      </LegalSection>

      <LegalSection title="7. Changes">
        <p>
          We may update these Terms as the product evolves. Continued use after
          changes are posted constitutes acceptance of the updated Terms.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
