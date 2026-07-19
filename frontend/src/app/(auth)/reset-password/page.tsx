"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { useAppDispatch } from "@/store/hooks";
import { resetPassword } from "@/store/authSlice";
import { validatePassword } from "@/lib/password";

function ResetPasswordForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  // The email was passed from the forgot-password step via the query string.
  const email = useSearchParams().get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email) {
      showError("Missing email. Please start again from the forgot-password page.");
      return;
    }
    const pwdError = validatePassword(password);
    if (pwdError) {
      showError(pwdError);
      return;
    }
    if (password !== confirmPassword) {
      showError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await dispatch(resetPassword({ email, password })).unwrap();
      showSuccess("Password updated. Please log in.");
      // Send them to login to sign in with the new password.
      router.push("/login");
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle={email ? `Choose a new password for ${email}.` : "Choose a strong password."}
      footer={
        <Link href="/login" className="font-semibold text-root-primary hover:underline">
          Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          id="password"
          label="New password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="8+ chars, capital, number & symbol"
          autoComplete="new-password"
          required
        />
        <TextField
          id="confirmPassword"
          label="Confirm new password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          required
        />

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Updating..." : "Reset password"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  // useSearchParams must sit inside a Suspense boundary in the App Router.
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
