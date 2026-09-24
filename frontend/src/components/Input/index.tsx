import { forwardRef, useId } from "react";
import type { InputProps } from "./index.ts";

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, id, className = "", ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="group relative flex flex-col gap-1.5">
      <label htmlFor={inputId} className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={`border-0 border-b border-rule bg-transparent px-0.5 pb-2.5 pt-1.5 font-sans text-[15px] text-ink outline-none focus-visible:outline-none focus:border-transparent ${className}`}
        {...props}
      />
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-focus-within:scale-x-100"
      />
    </div>
  );
});
