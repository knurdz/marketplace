import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="10 November 2026">
      <LegalSection title="1. Who we are">
        <p>
          Knurdz Marketplace (“Knurdz”, “we”) is a peer-to-peer marketplace for
          the community. This policy explains what personal data we collect and
          how we use it when you use{" "}
          <a href="https://marketplace.knurdz.org" className="underline">
            marketplace.knurdz.org
          </a>{" "}
          and related local development environments.
        </p>
      </LegalSection>

      <LegalSection title="2. What we collect">
        <p>
          Account details you provide (email, display name, optional phone or
          bio), OAuth profile data when you sign in with Google or GitHub (such
          as name and email), buy-request metadata needed to connect buyers and
          sellers, seller shop details if you apply as a seller, and files you
          upload (for example avatars or product images).
        </p>
      </LegalSection>

      <LegalSection title="3. How we use data">
        <p>
          We use this information to operate authentication, listings, buy
          requests, seller onboarding, and admin moderation. Phone and email are
          shared with the other party on a buy request so you can arrange the
          sale. We do not sell personal data.
        </p>
      </LegalSection>

      <LegalSection title="4. Processors and sign-in providers">
        <p>
          Authentication is handled with Better Auth. Social sign-in may use
          Google and GitHub. Application data is stored in our MariaDB database
          and files on local or hosted disk storage. Knurdz does not process
          card payments or bank slips.
        </p>
      </LegalSection>

      <LegalSection title="5. Sessions and cookies">
        <p>
          We use HTTP-only session cookies to keep you signed in. Clearing
          cookies or signing out ends the local session. We do not use
          third-party advertising trackers in the MVP storefront.
        </p>
      </LegalSection>

      <LegalSection title="6. Access and retention">
        <p>
          You can update profile fields while signed in. Access controls limit
          users to their own data where applicable. Retention follows
          operational needs for requests, moderation, and dispute resolution.
        </p>
      </LegalSection>

      <LegalSection title="7. Contact">
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
