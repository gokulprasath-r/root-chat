// A calm, brand-coloured full-screen spinner. Shown during the moments where a
// page has no content to display yet — restoring the session, or redirecting
// between the auth pages and the chat app — so the user never sees a blank flash.
export default function FullScreenLoader({ label }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-root-bg">
      <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-root-primary/25 border-t-root-primary" />
      {label ? <p className="text-sm font-medium text-root-secondary">{label}</p> : null}
    </div>
  );
}
