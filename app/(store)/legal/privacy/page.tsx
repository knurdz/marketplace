import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage
      shell="$ ./legal --privacy"
      title="Privacy"
      updated="11 August 2026"
    >
      <LegalSection title="1. What we collect">
        <p>
          Account details you provide (such as email, display name, and optional
          phone or bio), order and payment metadata needed to fulfill purchases,
          and files you upload (for example avatars or bank slips).
        </p>
      </LegalSection>

      <LegalSection title="2. How we use data">
        <p>
          We use this information to operate authentication, listings, checkout,
          order tracking, seller onboarding, and admin moderation. We do not
          sell personal data.
        </p>
      </LegalSection>

      <LegalSection title="3. Processors">
        <p>
          Authentication, database, and storage are provided by Appwrite.
          Card payments (when enabled) go through PayHere. Bank transfers are
          verified by platform admins using uploaded slips stored in private
          buckets.
        </p>
      </LegalSection>

      <LegalSection title="4. Sessions and cookies">
        <p>
          We use an HTTP-only session cookie to keep you signed in. Clearing
          cookies or signing out ends the local session. We do not use
          third-party advertising trackers in the MVP storefront.
        </p>
      </LegalSection>

      <LegalSection title="5. Access and retention">
        <p>
          You can update profile fields while signed in. Row-level permissions
          limit users to their own data where applicable. Retention follows
          operational needs for orders, payments, and dispute resolution.
        </p>
      </LegalSection>

      <LegalSection title="6. Contact">
        <p>
          For privacy questions during development, contact your Knurdz project
          admin. Production contact details will replace this section before
          launch.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
