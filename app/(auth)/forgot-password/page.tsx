import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div>
      <p className="font-mono text-sm text-accent">$ ./auth --recover</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        Forgot password
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We will email a reset link if an account exists for that address.
      </p>
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
