import { type SelectHTMLAttributes } from "react";

type Option = { value: string | number; label: string };

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: Option[];
};

export function Select({ label, options, className = "", id, ...rest }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="font-body text-label-md font-medium uppercase tracking-editorial text-on-surface-variant"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`
          bg-surface-container-high text-on-surface font-body text-body-md
          px-4 py-3 rounded-lg outline-none min-h-[52px]
          transition-all duration-150
          focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary
          ${className}
        `}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
