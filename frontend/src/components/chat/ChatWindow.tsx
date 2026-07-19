"use client";

import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import ContactInfoModal from "./ContactInfoModal";
import ConfirmDialog from "./ConfirmDialog";
import EmojiPicker from "./EmojiPicker";
import { BackIcon, SendIcon, ChatsIcon, InfoIcon, SmileIcon } from "./icons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { sendMessage, clearChat } from "@/store/chatSlice";
import { avatarColor } from "@/lib/avatarColor";
import { formatTime } from "@/lib/time";

type ChatWindowProps = {
  className?: string;
  onBack: () => void; // phone/tablet: return to the list
};

export default function ChatWindow({ className = "", onBack }: ChatWindowProps) {
  const dispatch = useAppDispatch();
  const activeId = useAppSelector((s) => s.chat.activeId);
  const conversation = useAppSelector((s) => s.chat.conversations.find((c) => c.id === activeId));
  const messages = useAppSelector((s) => (activeId ? (s.chat.messages[activeId] ?? []) : []));
  const myId = useAppSelector((s) => s.auth.user?.id);
  const onlineUserIds = useAppSelector((s) => s.chat.onlineUserIds);

  const [infoOpen, setInfoOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [draft, setDraft] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Emoji panel and the on-screen keyboard are mutually exclusive: opening the
  // picker dismisses the keyboard (blur), closing it brings the keyboard back.
  function toggleEmoji() {
    const next = !emojiOpen;
    setEmojiOpen(next);
    if (next) inputRef.current?.blur();
    else inputRef.current?.focus();
  }

  // Close the emoji picker when tapping anywhere except the picker or its button.
  useEffect(() => {
    if (!emojiOpen) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (pickerRef.current?.contains(target)) return;
      if (emojiBtnRef.current?.contains(target)) return;
      setEmojiOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [emojiOpen]);

  // Reset composer when switching conversations.
  useEffect(() => {
    setDraft("");
    setEmojiOpen(false);
    setInfoOpen(false);
  }, [activeId]);

  // Keep the newest message in view.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, activeId]);

  function handleSend() {
    const text = draft.trim();
    if (!text || !activeId) return;
    dispatch(sendMessage({ convId: activeId, text }));
    setDraft("");
  }

  if (!conversation) {
    // Empty state (laptop, before a chat is picked).
    return (
      <section className={`flex-col overflow-hidden bg-[#FBFAF6] ${className}`}>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-root-primary/10 text-root-primary">
            <ChatsIcon className="h-10 w-10" />
          </div>
          <p className="text-2xl font-semibold text-root-primary">Your messages</p>
          <p className="max-w-xs text-base text-root-secondary">
            Search a username and pick a chat to start messaging.
          </p>
        </div>
      </section>
    );
  }

  const contact = conversation.user;
  const color = avatarColor(contact.username);
  const isOnline = onlineUserIds.includes(contact.id);

  return (
    <section className={`flex-col overflow-hidden bg-[#FBFAF6] ${className}`}>
      {/* Header: back (phone/tablet), the contact (clickable), and the info button. */}
      <header className="flex items-center gap-4 border-b border-black/5 px-4 py-3.5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="text-root-secondary hover:text-root-primary lg:hidden"
        >
          <BackIcon className="h-7 w-7" />
        </button>

        <button
          type="button"
          onClick={() => setInfoOpen(true)}
          className="flex min-w-0 flex-1 items-center gap-4 text-left"
        >
          <div className="relative flex-shrink-0">
            <Avatar name={contact.name} color={color} src={contact.avatar || undefined} size={52} />
            {isOnline && (
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#FBFAF6] bg-root-accent" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-root-primary">{contact.name}</p>
            <p className={`text-sm ${isOnline ? "text-root-accent" : "text-root-secondary"}`}>
              {isOnline ? "online" : "offline"}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setInfoOpen(true)}
          aria-label="View profile"
          title="View profile"
          className="text-root-secondary hover:text-root-primary"
        >
          <InfoIcon className="h-6 w-6" />
        </button>
      </header>

      {/* Messages. */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-root-bg px-6 py-5">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-root-secondary">No messages here yet. Say hi 👋</p>
          </div>
        ) : (
          messages.map((msg) => {
            const fromMe = msg.senderId === myId;
            return (
              <div key={msg.id} className={`flex ${fromMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-[15px] shadow-sm ${
                    fromMe
                      ? "rounded-br-sm bg-root-primary text-white"
                      : "rounded-bl-sm bg-white text-root-primary"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  <span
                    className={`mt-1 block text-right text-[11px] ${
                      fromMe ? "text-white/70" : "text-root-secondary"
                    }`}
                  >
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer with emoji picker. */}
      <footer className="relative flex items-center gap-2 border-t border-black/5 px-4 py-3.5">
        {/* Picker: full-width bottom panel on phones/tablets, small popup on laptops. */}
        {emojiOpen && (
          <div
            ref={pickerRef}
            className="absolute inset-x-0 bottom-full z-10 mb-2 px-2 lg:left-2 lg:right-auto lg:px-0"
          >
            <EmojiPicker onSelect={(emoji) => setDraft((d) => d + emoji)} />
          </div>
        )}

        <button
          ref={emojiBtnRef}
          type="button"
          onClick={toggleEmoji}
          aria-label="Emoji"
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
            emojiOpen
              ? "bg-root-primary/10 text-root-primary"
              : "text-root-secondary hover:text-root-primary"
          }`}
        >
          <SmileIcon className="h-6 w-6" />
        </button>

        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => setEmojiOpen(false)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
          placeholder="Type a message"
          className="flex-1 rounded-full bg-black/5 px-5 py-3.5 text-base text-root-primary outline-none placeholder:text-root-secondary/60"
        />
        <button
          type="button"
          onClick={handleSend}
          aria-label="Send"
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-root-primary text-white transition-colors hover:bg-root-secondary"
        >
          <SendIcon className="h-6 w-6" />
        </button>
      </footer>

      {/* Contact details for the person we're chatting with. */}
      {infoOpen && (
        <ContactInfoModal
          name={contact.name}
          username={contact.username}
          about={contact.about}
          color={color}
          avatar={contact.avatar || undefined}
          online={isOnline}
          onClose={() => setInfoOpen(false)}
          onClearChat={() => {
            setInfoOpen(false);
            setConfirmClear(true);
          }}
        />
      )}

      {/* Confirm before wiping the thread (clears for you only). */}
      {confirmClear && (
        <ConfirmDialog
          title="Clear chat"
          message="This removes all messages in this chat for you. This can't be undone."
          confirmLabel="Clear chat"
          danger
          onClose={() => setConfirmClear(false)}
          onConfirm={() => {
            if (activeId) dispatch(clearChat(activeId));
            setConfirmClear(false);
          }}
        />
      )}
    </section>
  );
}
