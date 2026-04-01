// All badges: rounded-full (9999px) per spec
// Live: tertiary-container + pulse animation per spec
// No 1px borders — background shifts only

type Variant = "live" | "free" | "cleaning" | "training" | "tournament" | "waiting" | "done";

const classes: Record<Variant, string> = {
  live: "bg-tertiary-container text-on-tertiary-container animate-pulse",
  free: "bg-secondary-container text-on-secondary-container",
  cleaning: "bg-surface-container text-on-surface-variant",
  training: "bg-primary-container text-on-primary-container",
  tournament: "bg-tertiary text-on-tertiary",
  waiting: "bg-surface-container-high text-on-surface-variant",
  done: "bg-surface-container text-on-surface-variant opacity-60",
};

type BadgeProps = {
  variant: Variant;
  label?: string;
  className?: string;
};

export function Badge({ variant, label, className = "" }: BadgeProps) {
  const display = label ?? variant.charAt(0).toUpperCase() + variant.slice(1);
  return (
    <span
      className={`inline-block font-body text-label-sm font-semibold uppercase tracking-editorial px-3 py-1 rounded-full ${classes[variant]} ${className}`}
    >
      {display}
    </span>
  );
}
