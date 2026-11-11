import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto w-full max-w-[30rem] px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-center text-2xl font-semibold tracking-tight text-foreground">
        Forgot password
      </h1>
      <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
        Enter the email on your account.
        <br />
        We&apos;ll send a reset link if it matches a user.
      </p>
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
