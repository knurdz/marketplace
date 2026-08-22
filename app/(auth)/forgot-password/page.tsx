import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { PageHeader } from "@/components/layout/page-header";

export default function ForgotPasswordPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="Forgot password"
        description="We will email a reset link if an account exists for that address."
      />
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
