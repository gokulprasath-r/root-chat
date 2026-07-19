import GuestGuard from "@/components/auth/GuestGuard";

// Layout shared by every page in the (auth) route group. The parentheses mean
// "(auth)" is only for grouping — it does NOT show up in the URL, so the routes
// stay /login, /signup, etc. GuestGuard keeps logged-in users out of these pages.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestGuard>
      <div className="flex min-h-screen items-center justify-center bg-root-bg px-4 py-10">
        {children}
      </div>
    </GuestGuard>
  );
}
