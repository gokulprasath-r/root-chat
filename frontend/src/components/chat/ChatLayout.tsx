"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser } from "@/store/authSlice";
import {
  fetchConversations,
  messageReceived,
  presenceState,
  presenceUpdate,
  markRead,
  resetChat,
  setActive,
  setMe,
  type Message,
} from "@/store/chatSlice";
import { getSocket, disconnectSocket } from "@/lib/socket";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import ProfileModal from "./ProfileModal";
import ConfirmDialog from "./ConfirmDialog";

type IncomingMessage = { conversationId: string; message: Message };

export default function ChatLayout() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const activeId = useAppSelector((state) => state.chat.activeId);
  const conversations = useAppSelector((state) => state.chat.conversations);
  const meId = useAppSelector((state) => state.auth.user?.id);

  const [profileOpen, setProfileOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  // Live refs so the (run-once) socket handler always sees current values.
  const knownIds = useRef<Set<string>>(new Set());
  const activeIdRef = useRef<string | null>(null);
  useEffect(() => {
    knownIds.current = new Set(conversations.map((c) => c.id));
  }, [conversations]);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  // Record who we are (used to tell our own messages apart from incoming ones).
  useEffect(() => {
    if (meId) dispatch(setMe(meId));
  }, [meId, dispatch]);

  // Load conversations and wire up the real-time socket once.
  useEffect(() => {
    dispatch(fetchConversations());

    const socket = getSocket();

    const onMessage = (payload: IncomingMessage) => {
      if (!knownIds.current.has(payload.conversationId)) {
        dispatch(fetchConversations()); // a new person messaged us
      }
      dispatch(messageReceived(payload));
      // If we're already looking at this chat, mark it read right away.
      if (payload.conversationId === activeIdRef.current) {
        dispatch(markRead(payload.conversationId));
      }
    };
    const onPresenceState = (ids: string[]) => dispatch(presenceState(ids));
    const onPresenceUpdate = (p: { userId: string; online: boolean }) =>
      dispatch(presenceUpdate(p));

    socket.on("message:new", onMessage);
    socket.on("presence:state", onPresenceState);
    socket.on("presence:update", onPresenceUpdate);

    return () => {
      socket.off("message:new", onMessage);
      socket.off("presence:state", onPresenceState);
      socket.off("presence:update", onPresenceUpdate);
      disconnectSocket();
    };
  }, [dispatch]);

  async function doLogout() {
    await dispatch(logoutUser());
    dispatch(resetChat());
    router.replace("/login");
  }

  return (
    // Two full-screen columns, edge to edge. The side-by-side layout only kicks
    // in on laptops (lg+); phones and tablets show one column at a time.
    <div className="flex h-screen">
      {/* Left column — chat list. Hidden on phone/tablet once a chat is open. */}
      <ChatList
        className={`w-full flex-shrink-0 lg:flex lg:w-[420px] xl:w-[480px] ${
          activeId ? "hidden lg:flex" : "flex"
        }`}
        onProfile={() => setProfileOpen(true)}
        onLogout={() => setConfirmLogout(true)}
        profileActive={profileOpen}
      />

      {/* Right column — chat window. Hidden on phone/tablet until a chat opens. */}
      <ChatWindow
        className={`min-w-0 flex-1 ${activeId ? "flex" : "hidden lg:flex"}`}
        onBack={() => dispatch(setActive(null))}
      />

      {/* Profile dialog. */}
      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}

      {/* Logout confirmation. */}
      {confirmLogout && (
        <ConfirmDialog
          title="Log out"
          message="Are you sure you want to log out of Root?"
          confirmLabel="Log out"
          onClose={() => setConfirmLogout(false)}
          onConfirm={doLogout}
        />
      )}
    </div>
  );
}
