"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { useAppDispatch } from "@/store/hooks";
import { signupUser } from "@/store/authSlice";
import { validatePassword } from "@/lib/password";

export default function SignupPage() {
  const dispatch = useAppDispatch();
  const { showError } = useToast();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Basic client-side checks before we ever hit the server.
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
      // On success the user is authenticated and GuestGuard redirects to /home.
      await dispatch(signupUser({ username, email, password })).unwrap();
    } catch (err) {
      showError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Root and start growing real conversations."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-root-primary hover:underline">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          id="username"
          label="Username"
          value={username}
          onChange={setUsername}
          placeholder="yourname"
          autoComplete="username"
          required
        />
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
        <TextField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="8+ chars, capital, number & symbol"
          autoComplete="new-password"
          required
        />
        <TextField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          required
        />

        <Button type="submit" fullWidth className="mt-2" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
