"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import FullScreenLoader from "@/components/ui/FullScreenLoader";

// Wraps guest-only pages (landing + auth screens). Once the session check has
// finished, a logged-in user is bounced to /chats so they can't see these pages.
export default function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (initialized && user) {
      router.replace("/chats");
    }
  }, [initialized, user, router]);

  // While the session is being restored, or while redirecting a logged-in user,
  // show a loader instead of a blank screen (the redirect can take a moment on a
  // slow network) so the public page never flashes.
  if (!initialized || user) {
    return <FullScreenLoader />;
  }

  return <>{children}</>;
}
