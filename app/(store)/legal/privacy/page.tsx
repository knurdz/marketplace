import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="11 November 2026">
      <LegalSection title="1. Who we are">
        <p>
          Knurdz Marketplace (“Knurdz”, “we”) connects buyers and sellers. We
          do not charge platform fees and we do not take payment. This policy
          explains what personal data we collect and how we use it when you use{" "}
          <a href="https://marketplace.knurdz.org" className="underline">
            marketplace.knurdz.org
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. What we collect">
        <p>
          Account details you provide: email, display name, phone, and an
          optional bio or avatar. If you sign in with Google or GitHub, we
          receive the name and email that provider shares. If you apply as a
          seller, we store your shop name, public shop link, bio, banner, and
          any return or shipping notes you write.
        </p>
        <p>
          We also store listings and product images, purchase requests (the
          product, quantity, price, and whether the request is open, sold, or
          cancelled), reviews, listing reports, wishlist items, and in-app
          notifications. Admin actions are kept in an audit log. We do not
          collect card numbers or bank account numbers.
        </p>
      </LegalSection>

      <LegalSection title="3. How we use data">
        <p>
          We use this information to run accounts, show listings, connect a
          buyer and a seller on a purchase request, and review shops, new
          listings, reviews, and reports. We send email for address
          verification, password reset, and notices about your requests,
          reviews, and reports. We do not sell personal data.
        </p>
      </LegalSection>

      <LegalSection title="4. Who sees your contact details">
        <p>
          Your phone and email are not shown on public product or shop pages.
          After you send or receive a purchase request, those details are shown
          to the other person on that request so you can arrange the sale.
          Admins can see them when moderating the marketplace. Wishlist items
          are visible only to you.
        </p>
      </LegalSection>

      <LegalSection title="5. Processors and sign-in providers">
        <p>
          Authentication is handled with Better Auth. Social sign-in may use
          Google and GitHub. Application data is stored in our MariaDB database
          and files on disk storage we operate. Email is sent through our mail
          server for verification, password reset, and marketplace notices.
          Knurdz does not use a payment processor, and it does not process card
          payments or bank slips.
        </p>
      </LegalSection>

      <LegalSection title="6. Sessions and cookies">
        <p>
          We use HTTP-only session cookies to keep you signed in. Clearing
          cookies or signing out ends the local session. We do not use
          third-party advertising trackers on the storefront.
        </p>
      </LegalSection>

      <LegalSection title="7. Access and retention">
        <p>
          You can update your profile while signed in. Access controls limit
          you to your own requests, wishlist, and shop where that applies. We
          keep purchase requests, reviews, reports, and audit records for as
          long as we need them to operate the marketplace and review misuse.
        </p>
      </LegalSection>

      <LegalSection title="8. Contact">
        <p>
          For privacy questions, contact the Knurdz Marketplace operators at{" "}
          <a href="mailto:privacy@knurdz.org" className="underline">
            privacy@knurdz.org
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
