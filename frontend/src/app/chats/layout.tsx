import type { Metadata } from "next";

// Server layout just so this route can set its tab title → "Root | Chats".
export const metadata: Metadata = { title: "Chats" };

export default function ChatsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
