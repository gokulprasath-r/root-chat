"use client";

import Modal from "./Modal";
import Avatar from "./Avatar";
import { TrashIcon } from "./icons";

type ContactInfoModalProps = {
  name: string;
  username: string;
  about: string;
  color: string;
  avatar?: string;
  online: boolean;
  onClearChat: () => void; // opens the clear-chat confirmation
  onClose: () => void;
};

// Read-only details of the person we're chatting with, plus chat actions.
export default function ContactInfoModal({
  name,
  username,
  about,
  color,
  avatar,
  online,
  onClearChat,
  onClose,
}: ContactInfoModalProps) {
  return (
    <Modal title="Contact info" onClose={onClose}>
      <div className="flex flex-col items-center gap-3">
        <Avatar name={name} color={color} src={avatar} size={112} />
        <div className="text-center">
          <p className="text-xl font-bold text-root-primary">{name}</p>
          <p className={`text-sm ${online ? "text-root-accent" : "text-root-secondary"}`}>
            {online ? "online" : "offline"}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-root-secondary">About</p>
          <p className="mt-1 text-base text-root-primary">{about}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-root-secondary">
            Username
          </p>
          <p className="mt-1 text-base text-root-primary">@{username}</p>
        </div>
      </div>

      {/* Chat actions. */}
      <div className="mt-6 space-y-1 border-t border-black/5 pt-4">
        <button
          type="button"
          onClick={onClearChat}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-root-primary hover:bg-black/5"
        >
          <TrashIcon className="h-5 w-5" />
          <span className="text-base font-medium">Clear chat</span>
        </button>
      </div>
    </Modal>
  );
}
