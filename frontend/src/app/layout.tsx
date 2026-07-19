import type { Metadata } from "next";
import ReduxProvider from "@/store/Provider";
import { ToastProvider } from "@/components/ui/ToastProvider";
import "./globals.css";

export const metadata: Metadata = {
  // Server pages set a `title` string that fills "%s"; client pages set the tab
  // title themselves via usePageTitle. Pages with no title fall back to "Root".
  title: { default: "Root", template: "Root | %s" },
  description: "Root chat application",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* ReduxProvider exposes the store; ToastProvider exposes useToast() to any page. */}
      <body>
        <ReduxProvider>
          <ToastProvider>{children}</ToastProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
