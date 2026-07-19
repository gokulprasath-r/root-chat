import Image from "next/image";
import Link from "next/link";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

// Shared frame for every auth screen: the Root logo on top, then a card holding
// the form, then an optional footer line (e.g. "Already have an account?").
export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="w-full max-w-md">
      <div className="flex justify-center">
        <Link href="/" aria-label="Root home">
          <Image
            src="/logos/main-logo.png"
            alt="Root"
            width={240}
            height={117}
            priority
            className="h-auto w-44"
          />
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-root-secondary/15 bg-white/60 p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-root-primary">{title}</h1>
        {subtitle && <p className="mt-2 text-center text-sm text-root-secondary">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>

      {footer && <div className="mt-6 text-center text-sm text-root-secondary">{footer}</div>}
    </div>
  );
}
