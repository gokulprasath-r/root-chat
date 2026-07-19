import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FeatureCard from "@/components/FeatureCard";
import GuestGuard from "@/components/auth/GuestGuard";
import { ConversationIcon, ConnectionsIcon, SecureIcon, GrowIcon } from "@/components/icons";

// The landing shares the root segment, so the "Root | %s" template doesn't apply
// here — set the full title explicitly.
export const metadata: Metadata = { title: "Root | Welcome" };

// The four selling points shown as cards, mirroring the reference layout.
const features = [
  {
    icon: <ConversationIcon />,
    title: "Real Conversations",
    description: "Talk about what matters, without the noise.",
  },
  {
    icon: <ConnectionsIcon />,
    title: "Meaningful Connections",
    description: "Build relationships that actually last.",
  },
  {
    icon: <SecureIcon />,
    title: "Safe & Secure",
    description: "Your chats stay private and protected.",
  },
  {
    icon: <GrowIcon />,
    title: "Grow Together",
    description: "Nurture friendships and watch them flourish.",
  },
];

export default function HomePage() {
  return (
    <GuestGuard>
      <div className="min-h-screen bg-root-bg">
      {/* Everything is one centered column: logo, heading, subtext, buttons, cards. */}
      <main className="mx-auto flex max-w-5xl flex-col items-center px-6 py-14 text-center">
        <Image
          src="/logos/main-logo.png"
          alt="Root"
          width={320}
          height={156}
          priority
          className="h-auto w-56 md:w-72"
        />

        <h1 className="mt-8 max-w-2xl text-4xl font-bold leading-tight text-root-primary md:text-5xl">
          Where every conversation takes root.
        </h1>

        <p className="mt-5 max-w-xl text-base text-root-secondary md:text-lg">
          Root is a calm, private space to have meaningful conversations and grow real connections.
          Deep convo starts here.
        </p>

        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/signup"
            className="rounded-full bg-root-primary px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-root-secondary"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-root-primary px-7 py-3 text-sm font-semibold text-root-primary transition-colors hover:bg-root-primary hover:text-white"
          >
            Login
          </Link>
        </div>

        {/* Feature cards row (single column on mobile, four across on desktop). */}
        <section className="mt-16 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </section>
      </main>
      </div>
    </GuestGuard>
  );
}
