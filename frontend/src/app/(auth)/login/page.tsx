"use client";

import { useState } from "react";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { useAppDispatch } from "@/store/hooks";
import { loginUser } from "@/store/authSlice";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const { showError } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // On success the user becomes authenticated and GuestGuard redirects to /home.
      await dispatch(loginUser({ email, password })).unwrap();
    } catch (err) {
      showError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Login to continue your conversations."
      footer={
        <>
          New to Root?{" "}
          <Link href="/signup" className="font-semibold text-root-primary hover:underline">
            Create an account
          </Link>
        </>
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
        <TextField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Your password"
          autoComplete="current-password"
          required
        />

        {/* Right-aligned link to the reset flow. */}
        <div className="-mt-1 flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-root-secondary hover:text-root-primary"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </AuthShell>
  );
}
