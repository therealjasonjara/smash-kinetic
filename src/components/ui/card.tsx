import { type HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  elevated?: boolean;
};

export function Card({ elevated = false, className = "", children, ...rest }: CardProps) {
  return (
    <div
      className={`bg-surface-container-lowest rounded-xl ${elevated ? "shadow-kinetic" : ""} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
