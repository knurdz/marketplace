import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { buildPublicMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPublicMetadata({
  title: "FAQ",
  description:
    "Frequently asked questions about buying, selling, purchase requests, reviews, and zero platform fees on Knurdz Marketplace.",
  canonicalPath: "/faq",
});

export default function FaqPage() {
  return (
    <LegalPage eyebrow="Help" title="FAQ" updated="11 November 2026">
      <LegalSection title="How do I buy something?">
        <p>
          Browse or search active listings, open a product, and choose a
          quantity. You need to be signed in and have a phone number on your
          account. Tapping Buy sends a purchase request to the seller. The
          request shows their phone and email, and shows yours to them, so you
          can arrange the sale directly.
        </p>
      </LegalSection>

      <LegalSection title="Does Knurdz charge fees?">
        <p>
          No. Knurdz does not charge buyers or sellers a listing fee, a
          commission, or any other platform fee. The price on a listing is
          between you and the other person.
        </p>
      </LegalSection>

      <LegalSection title="How do I pay the seller?">
        <p>
          You pay the seller yourselves. Knurdz does not take card payments,
          bank transfers, or cash, and it does not hold money for either side.
          Agree how and when to pay when you contact each other.
        </p>
      </LegalSection>

      <LegalSection title="When is a request sold or cancelled?">
        <p>
          The seller marks the request sold or cancelled. Sold reduces the
          listing’s stock by the quantity on the request, if enough stock
          remains. Cancelled leaves the stock unchanged. A request is not an
          order that Knurdz fulfills.
        </p>
      </LegalSection>

      <LegalSection title="How do I sell on Knurdz?">
        <p>
          Create an account and apply as a seller. An admin reviews your shop
          before you can publish. Add a phone number so buyers can reach you.
          New listings start as drafts. Submit a draft for review; it appears
          on the store only after an admin approves it. A rejected listing
          stays off the store until you fix it and submit it again.
        </p>
      </LegalSection>

      <LegalSection title="What does Knurdz review?">
        <p>
          Before something is public, an admin reviews new seller shops, new
          listings, and buyer reviews. A later edit to a listing that is
          already live does not automatically go back through review. The seller
          stays responsible for keeping that listing accurate. A signed-in user
          can report someone else’s listing, and the team reviews those
          reports.
        </p>
      </LegalSection>

      <LegalSection title="How do reviews work?">
        <p>
          After a seller marks your request sold, you can leave one rating of
          that seller, from 1 to 5, with an optional comment. The review stays
          hidden until an admin approves it. Approved reviews appear on the
          seller’s shop. Reviews are about the seller, not a single product.
        </p>
      </LegalSection>

      <LegalSection title="How do I report a listing?">
        <p>
          Sign in and report someone else’s listing with a reason. You cannot
          report your own listing. An admin can dismiss the report, take the
          listing down, or suspend the shop.
        </p>
      </LegalSection>

      <LegalSection title="What is the wishlist?">
        <p>
          The wishlist saves listings for you. Only you can see what you have
          saved.
        </p>
      </LegalSection>

      <LegalSection title="How do accounts and contact details work?">
        <p>
          You can sign up with email or with Google or GitHub. Confirm your
          email from the message we send, and use the recovery link if you
          forget your password. Your phone and email are not shown on public
          product or shop pages. They are shared with the other person only
          after a purchase request, and with admins who moderate the
          marketplace.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
