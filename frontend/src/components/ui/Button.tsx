type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
};

// Primary action button (coffee-brown pill). Spreads the native button props so
// callers can set type="submit", disabled, onClick, etc.
export default function Button({ fullWidth, className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`rounded-full bg-root-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-root-secondary disabled:cursor-not-allowed disabled:opacity-60 ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    />
  );
}
