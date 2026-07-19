// Hand-drawn line-art icons for the landing page feature cards.
// The outline uses `currentColor` (so the parent controls the brown), and each
// icon carries a small olive-green leaf accent to echo the Root tree logo.

const ACCENT = "#6B8E23";

// Shared wrapper so every icon has the same size + stroke style.
function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={44}
      height={44}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

// Real Conversations – a speech bubble with a leaf.
export function ConversationIcon() {
  return (
    <Icon>
      <rect x="6" y="9" width="25" height="19" rx="6" />
      <path d="M13 28v6l8-6" />
      <path d="M33 8c6 0 9 3 9 9-6 0-9-3-9-9z" fill={ACCENT} stroke="none" />
    </Icon>
  );
}

// Meaningful Connections – two people standing together.
export function ConnectionsIcon() {
  return (
    <Icon>
      {/* back person */}
      <circle cx="18" cy="15" r="5" />
      <path d="M10 34a8 8 0 0116 0" />
      {/* front person */}
      <circle cx="31" cy="18" r="4.5" />
      <path d="M25 34a7 7 0 0114 0" />
      <path d="M38 9c5 0 8 3 8 8-5 0-8-3-8-8z" fill={ACCENT} stroke="none" />
    </Icon>
  );
}

// Safe & Secure – a shield with a lock inside.
export function SecureIcon() {
  return (
    <Icon>
      <path d="M24 6l14 5v9c0 10-6 16-14 20-8-4-14-10-14-20v-9z" />
      <rect x="18" y="22" width="12" height="9" rx="2" />
      <path d="M21 22v-2a3 3 0 016 0v2" />
    </Icon>
  );
}

// Grow Together – a sprout with two green leaves.
export function GrowIcon() {
  return (
    <Icon>
      <path d="M10 40h28" />
      <path d="M24 40V22" />
      <path d="M24 27c-8 0-13-4-13-11 8 0 13 4 13 11z" fill={ACCENT} stroke="none" />
      <path d="M24 23c8 0 13-4 13-11-8 0-13 4-13 11z" fill={ACCENT} stroke="none" />
    </Icon>
  );
}
