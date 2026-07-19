"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { useAppDispatch } from "@/store/hooks";
import { forgotPassword } from "@/store/authSlice";

export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showError } = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // We don't do email verification, so there's no reset link to send. The
      // backend just confirms the email exists, then we send the user to the
      // reset screen (passing the email along) to choose a new password.
      await dispatch(forgotPassword({ email })).unwrap();
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      showError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your email and we'll help you reset your password."
      footer={
        <Link href="/login" className="font-semibold text-root-primary hover:underline">
          Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Checking..." : "Continue"}
        </Button>
      </form>
    </AuthShell>
  );
}
