import { forwardRef } from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

const fieldBase =
  "w-full border border-rail-line bg-rail-navy/60 px-3.5 py-2.5 text-sm text-rail-white placeholder:text-rail-silver/50 outline-none transition-colors focus:border-rail-gold disabled:opacity-50";

export function Label({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-rail-silver mb-1.5">
      {children}
      {required && <span className="text-rail-gold ml-0.5">*</span>}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs text-rail-loss">
      {message}
    </p>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }>(
  ({ className, hasError, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(fieldBase, hasError && "border-rail-loss", className)}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }
>(({ className, hasError, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(fieldBase, "min-h-[120px] resize-y", hasError && "border-rail-loss", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }
>(({ className, hasError, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(fieldBase, "appearance-none", hasError && "border-rail-loss", className)}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
