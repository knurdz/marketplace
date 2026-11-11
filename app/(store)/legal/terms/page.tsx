import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service" updated="11 November 2026">
      <LegalSection title="1. Agreement">
        <p>
          By creating an account or using Knurdz Marketplace (“Knurdz”), you
          agree to these Terms of Service. If you do not agree, do not use the
          service.
        </p>
      </LegalSection>

      <LegalSection title="2. What Knurdz is">
        <p>
          Knurdz connects buyers and sellers. It is not the seller of listed
          goods, it is not a party to the sale, and it does not take payment.
          Knurdz does not charge listing fees, commissions, or other platform
          fees. The price, payment, and handover are agreed between the buyer
          and the seller.
        </p>
      </LegalSection>

      <LegalSection title="3. Accounts">
        <p>
          You register as a buyer. Selling requires a separate application. A
          shop stays closed until an admin approves it. Admins are provisioned
          by the Knurdz team. Access to seller and admin areas is enforced on
          the server. You need a phone number on your account before you can
          send or receive a purchase request. You are responsible for keeping
          your email and phone reachable.
        </p>
      </LegalSection>

      <LegalSection title="4. Listings">
        <p>
          Sellers are responsible for the title, description, price, images,
          stock, and any return or shipping notes on a listing. A new listing
          starts as a draft and appears on the store only after an admin
          approves it. A rejected listing stays off the store. An edit to a
          listing that is already live does not automatically return to review.
          The seller remains responsible for those changes. Knurdz may reject a
          listing, remove it from the store, or suspend a shop that breaks
          these Terms.
        </p>
      </LegalSection>

      <LegalSection title="5. Purchase requests">
        <p>
          A purchase request asks the seller to deal with you. It is not an
          order that Knurdz processes or guarantees. Phone and email on a
          request are shown only to the other party and to admins, not on
          public product or shop pages. Only the seller can mark a request sold
          or cancelled. Sold reduces stock by the requested quantity when
          enough stock remains. Cancelled leaves stock unchanged.
        </p>
      </LegalSection>

      <LegalSection title="6. Money">
        <p>
          Knurdz does not collect, hold, or transfer money, and it does not
          store card or bank account numbers. After a request, the buyer and
          seller contact each other and settle personally. Disputes about
          payment, delivery, or the goods are between those two people.
        </p>
      </LegalSection>

      <LegalSection title="7. Reviews and reports">
        <p>
          After a request is marked sold, the buyer may leave one review of
          that seller. The review is hidden until an admin approves it. Only
          approved reviews appear on the shop. A signed-in user may report
          someone else’s listing. Knurdz may dismiss the report, take the
          listing down, or suspend the shop.
        </p>
      </LegalSection>

      <LegalSection title="8. Acceptable use">
        <p>
          Do not misuse the platform: no fraud, illegal goods, harassment,
          scraping that harms the service, or attempts to bypass access
          controls. Do not post a listing you cannot stand behind, and do not
          leave a review for a sale that did not happen. We may suspend
          accounts that violate these Terms.
        </p>
      </LegalSection>

      <LegalSection title="9. Limitation of liability">
        <p>
          To the fullest extent permitted by law, Knurdz and its operators are
          not liable for losses arising from a sale, payment, or dispute
          between a buyer and a seller, or from a listing that was edited after
          it went live. The service is provided as available. Knurdz does not
          guarantee that a request will become a completed sale.
        </p>
      </LegalSection>

      <LegalSection title="10. Changes">
        <p>
          We may update these Terms as the product evolves. Continued use after
          changes are posted constitutes acceptance of the updated Terms.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact">
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
