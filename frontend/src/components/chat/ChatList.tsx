"use client";

import { useState } from "react";
import Avatar from "./Avatar";
import { SearchIcon, ProfileIcon, LogoutIcon } from "./icons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  searchUser,
  clearSearch,
  startConversation,
  setActive,
  fetchMessages,
  markRead,
} from "@/store/chatSlice";
import { avatarColor } from "@/lib/avatarColor";
import { formatConversationTime } from "@/lib/time";

type ChatListProps = {
  className?: string;
  onProfile: () => void;
  onLogout: () => void;
  profileActive: boolean;
};

function HeaderIcon({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
        active
          ? "bg-root-primary/10 text-root-primary"
          : "text-root-secondary hover:bg-black/5 hover:text-root-primary"
      }`}
    >
      {icon}
    </button>
  );
}

export default function ChatList({ className = "", onProfile, onLogout, profileActive }: ChatListProps) {
  const dispatch = useAppDispatch();
  const conversations = useAppSelector((s) => s.chat.conversations);
  const activeId = useAppSelector((s) => s.chat.activeId);
  const search = useAppSelector((s) => s.chat.search);
  const onlineUserIds = useAppSelector((s) => s.chat.onlineUserIds);

  const [query, setQuery] = useState("");
  const searching = query.trim().length > 0;

  function onQueryChange(value: string) {
    setQuery(value);
    // Reset any previous result so the "press enter" hint shows again.
    dispatch(clearSearch());
  }

  function runSearch() {
    const q = query.trim();
    if (q) dispatch(searchUser(q));
  }

  function openConversation(id: string) {
    dispatch(setActive(id));
    dispatch(fetchMessages(id));
    dispatch(markRead(id));
  }

  async function openSearchResult(userId: string) {
    await dispatch(startConversation(userId));
    setQuery("");
  }

  return (
    <aside className={`flex-col overflow-hidden border-r border-black/5 bg-[#FBFAF6] ${className}`}>
      {/* Header: "Chats" on the left, profile + logout icons on the right. */}
      <header className="flex items-center justify-between border-b border-black/5 px-5 py-3">
        <h2 className="text-2xl font-bold text-root-primary">Chats</h2>
        <div className="flex items-center gap-1">
          <HeaderIcon
            icon={<ProfileIcon className="h-6 w-6" />}
            label="Profile"
            active={profileActive}
            onClick={onProfile}
          />
          <HeaderIcon icon={<LogoutIcon className="h-6 w-6" />} label="Logout" onClick={onLogout} />
        </div>
      </header>

      {/* Search a user by exact username to start a new chat. */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2.5 rounded-full bg-black/5 px-4 py-3">
          <SearchIcon className="h-5 w-5 text-root-secondary" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="Search by username"
            className="w-full bg-transparent text-base text-root-primary outline-none placeholder:text-root-secondary/60"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {searching ? (
          // --- Search results ---
          <div className="px-2">
            {search.status === "idle" && (
              <p className="px-3 py-4 text-sm text-root-secondary">
                Press Enter to search for “{query.trim()}”.
              </p>
            )}
            {search.status === "loading" && (
              <p className="px-3 py-4 text-sm text-root-secondary">Searching…</p>
            )}
            {search.status === "notfound" && (
              <p className="px-3 py-4 text-sm text-root-secondary">
                No user found with that username.
              </p>
            )}
            {search.status === "found" && search.result && (
              <button
                type="button"
                onClick={() => openSearchResult(search.result!.id)}
                className="flex w-full items-center gap-4 rounded-lg px-3 py-3 text-left hover:bg-black/5"
              >
                <Avatar
                  name={search.result.name}
                  color={avatarColor(search.result.username)}
                  src={search.result.avatar || undefined}
                  size={56}
                />
                <div className="min-w-0">
                  <p className="truncate text-[17px] font-medium text-root-primary">
                    {search.result.name}
                  </p>
                  <p className="truncate text-[15px] text-root-secondary">
                    @{search.result.username}
                  </p>
                </div>
              </button>
            )}
          </div>
        ) : conversations.length === 0 ? (
          <p className="px-5 py-6 text-sm text-root-secondary">
            No chats yet. Search a username above to start one.
          </p>
        ) : (
          // --- Conversation list ---
          conversations.map((chat) => {
            const active = chat.id === activeId;
            return (
              <button
                key={chat.id}
                type="button"
                onClick={() => openConversation(chat.id)}
                className={`flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors ${
                  active ? "bg-root-primary/10" : "hover:bg-black/5"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar
                    name={chat.user.name}
                    color={avatarColor(chat.user.username)}
                    src={chat.user.avatar || undefined}
                    size={56}
                  />
                  {onlineUserIds.includes(chat.user.id) && (
                    <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#FBFAF6] bg-root-accent" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[17px] font-medium text-root-primary">
                      {chat.user.name}
                    </span>
                    <span className="flex-shrink-0 text-sm text-root-secondary">
                      {chat.lastMessage ? formatConversationTime(chat.lastMessageAt) : ""}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <span className="truncate text-[15px] text-root-secondary">
                      {chat.lastMessage || "Say hi 👋"}
                    </span>
                    {chat.unread > 0 && (
                      <span className="flex h-6 min-w-[24px] flex-shrink-0 items-center justify-center rounded-full bg-root-accent px-1.5 text-sm font-medium text-white">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
