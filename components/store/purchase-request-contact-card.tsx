import type { PurchaseRequestContact } from "@/lib/types";
import { cn } from "@/lib/utils";

type PurchaseRequestContactCardProps = {
  title: string;
  contact: PurchaseRequestContact;
  variant?: "default" | "portal";
  /** Overrides the portal helper line under the title. */
  description?: string;
  className?: string;
};

function ContactCell({
  label,
  value,
  testId,
  href,
}: {
  label: string;
  value: string;
  testId?: string;
  href?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/15 px-3.5 py-3">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd
        className="mt-1 text-sm font-medium text-foreground"
        data-testid={testId}
      >
        {href ? (
          <a href={href} className="hover:text-accent">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

export function PurchaseRequestContactCard({
  title,
  contact,
  variant = "default",
  description,
  className,
}: PurchaseRequestContactCardProps) {
  const isPortal = variant === "portal";
  const helperText =
    description ??
    (isPortal
      ? "Reach out to the buyer to arrange payment and delivery."
      : null);

  return (
    <section
      className={cn(
        isPortal ? "space-y-4" : "rounded-xl border border-border bg-card p-4",
        className,
      )}
      data-testid="request-contact"
    >
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {helperText ? (
          <p className="mt-1 text-sm text-muted-foreground">{helperText}</p>
        ) : null}
      </div>

      <dl
        className={cn(
          "gap-3",
          isPortal ? "grid sm:grid-cols-3" : "mt-3 space-y-2 text-sm",
        )}
      >
        {isPortal ? (
          <>
            {contact.displayName ? (
              <ContactCell label="Name" value={contact.displayName} />
            ) : (
              <ContactCell label="Name" value="Not provided" />
            )}
            <ContactCell
              label="Phone"
              value={contact.phone ?? "Not provided"}
              testId="request-contact-phone"
              href={contact.phone ? `tel:${contact.phone}` : undefined}
            />
            <ContactCell
              label="Email"
              value={contact.email ?? "Not provided"}
              testId="request-contact-email"
              href={contact.email ? `mailto:${contact.email}` : undefined}
            />
          </>
        ) : (
          <>
            {contact.displayName ? (
              <div>
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium text-foreground">
                  {contact.displayName}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd
                className="font-medium text-foreground"
                data-testid="request-contact-phone"
              >
                {contact.phone ?? "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd
                className="font-medium text-foreground"
                data-testid="request-contact-email"
              >
                {contact.email ?? "Not provided"}
              </dd>
            </div>
          </>
        )}
      </dl>

      <p
        className={cn(
          "text-xs leading-relaxed text-muted-foreground",
          !isPortal && "mt-3",
        )}
      >
        Arrange payment and delivery directly. The marketplace does not process
        payments.
      </p>
    </section>
  );
}
