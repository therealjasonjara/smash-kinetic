import { type InputHTMLAttributes } from "react";

// Spec: surface-container-high fill; focus → surface-container-lowest + 2px primary ghost border
// Error state: error-container (vibrant, not punishing) — never raw error color

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className = "", id, ...rest }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="font-body text-label-md font-medium uppercase tracking-editorial text-on-surface-variant"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          bg-surface-container-high text-on-surface font-body text-body-md
          px-4 py-3 rounded-lg outline-none min-h-[52px]
          transition-all duration-150
          focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary
          placeholder:text-on-surface-variant/50
          ${error ? "ring-2 ring-error-container bg-surface-container-lowest" : ""}
          ${className}
        `}
        {...rest}
      />
      {error && (
        <p className="font-body text-label-md text-error-container">{error}</p>
      )}
    </div>
  );
}
