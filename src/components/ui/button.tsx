import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

// Primary: speed-streak gradient, rounded-xl (1.5rem) for primary containers
// Secondary: secondary-container bg, "tactical" feel
// Ghost/Tertiary: no bg, primary text — low-priority actions
// Danger: error-container bg per spec ("vibrant, not punishing")
const variantClasses: Record<Variant, string> = {
  primary:
    "btn-gradient text-on-primary font-headline font-semibold tracking-editorial uppercase shadow-kinetic hover:opacity-95 active:scale-95 disabled:opacity-50",
  secondary:
    "bg-secondary-container text-on-secondary-container font-headline font-semibold tracking-editorial uppercase hover:opacity-85 active:scale-95 disabled:opacity-50",
  ghost:
    "text-primary font-body font-medium hover:bg-primary/10 active:scale-95 disabled:opacity-40",
  danger:
    "bg-error-container text-on-error-container font-headline font-semibold tracking-editorial uppercase hover:opacity-85 active:scale-95 disabled:opacity-50",
};

// Spec: primary containers use xl (1.5rem) radius, badges/pills use full
const sizeClasses: Record<Size, string> = {
  sm: "px-5 py-2 text-label-md rounded-full min-h-[40px]",
  md: "px-6 py-3 text-label-md rounded-xl min-h-[48px]",
  lg: "px-8 py-4 text-body-md rounded-xl min-h-[56px]",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 transition-all duration-150 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
