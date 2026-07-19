type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

// One card in the "why Root" row: an icon, a title and a short line of copy.
export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-root-secondary/15 bg-white/40 px-6 py-8 text-center shadow-sm transition-transform hover:-translate-y-1">
      <span className="text-root-primary">{icon}</span>
      <h3 className="text-base font-semibold text-root-primary">{title}</h3>
      <p className="text-sm text-root-secondary">{description}</p>
    </div>
  );
}
