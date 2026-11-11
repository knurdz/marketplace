import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service" updated="10 November 2026">
      <LegalSection title="1. Agreement">
        <p>
          By creating an account or using Knurdz Marketplace (“Knurdz”), you
          agree to these Terms of Service. If you do not agree, do not use the
          service.
        </p>
      </LegalSection>

      <LegalSection title="2. Roles">
        <p>
          Users register as a buyer or apply as a seller. Sellers wait for admin
          approval before opening a shop. Admins are provisioned by the Knurdz
          team. Access to seller and admin areas is restricted by role checks
          enforced on the server.
        </p>
      </LegalSection>

      <LegalSection title="3. Listings and orders">
        <p>
          Sellers are responsible for accurate listing details, stock, and
          completing sales they mark as sold. Buyers are responsible for
          providing a reachable phone and email. Knurdz connects parties; sales
          happen between buyer and seller directly.
        </p>
      </LegalSection>

      <LegalSection title="4. Payments">
        <p>
          Knurdz does not process payments. After a buy request, buyers and
          sellers contact each other using the phone and email shown on that
          request and settle personally. The seller marks the request sold or
          cancelled when the deal is finished or abandoned.
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

      <LegalSection title="8. Contact">
        <p>
          Questions about these Terms:{" "}
          <a href="mailto:support@knurdz.org" className="underline">
            support@knurdz.org
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
