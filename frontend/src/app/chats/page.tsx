"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import ChatLayout from "@/components/chat/ChatLayout";
import FullScreenLoader from "@/components/ui/FullScreenLoader";

// The logged-in chats page: the 3-column chat app. Protected — if the session
// check has finished and there's no user, we bounce back to the login page.
export default function ChatsPage() {
  const router = useRouter();
  const { user, initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (initialized && !user) {
      router.replace("/login");
    }
  }, [initialized, user, router]);

  // While the session is being restored, or during the redirect (e.g. right after
  // deleting the account), show a loader instead of a blank screen.
  if (!initialized || !user) {
    return <FullScreenLoader />;
  }

  return <ChatLayout />;
}
