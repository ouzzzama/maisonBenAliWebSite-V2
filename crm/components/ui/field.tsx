import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const base =
  "focus-ring w-full rounded-xl border border-ink/12 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/35 transition disabled:opacity-60";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(base, "h-10", className)} {...props} />
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(base, "min-h-20 resize-y", className)} {...props} />
));
Textarea.displayName = "Textarea";

type OptionData = { value: string; label: string };

/** Les options restent écrites en <option> dans les formulaires : on les lit ici. */
function readOptions(children: React.ReactNode): OptionData[] {
  const options: OptionData[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const props = child.props as { value?: string | number; children?: React.ReactNode };
    if (child.type === "option") {
      const label = React.Children.toArray(props.children).join("").trim();
      options.push({ value: String(props.value ?? label), label });
    } else if (child.type === "optgroup") {
      options.push(...readOptions(props.children));
    }
  });
  return options;
}

/**
 * Liste déroulante du CRM : un vrai <select> reste dans le formulaire (donc
 * react-hook-form et la soumission ne changent pas), mais c'est un panneau
 * maison qui s'affiche — le menu natif du navigateur ignorait nos couleurs.
 */
export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, onChange, onBlur, disabled, value: controlledValue, defaultValue, ...props }, ref) => {
  const nativeRef = React.useRef<HTMLSelectElement>(null);
  React.useImperativeHandle(ref, () => nativeRef.current as HTMLSelectElement);

  const options = React.useMemo(() => readOptions(children), [children]);
  const [value, setValue] = React.useState(() => String(controlledValue ?? defaultValue ?? ""));
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const listId = React.useId();

  const currentIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );
  const selected = options[currentIndex];

  /* react-hook-form écrit dans le <select> caché (montage, reset) : on relit. */
  const syncFromNative = React.useCallback(() => {
    const el = nativeRef.current;
    if (!el) return;
    setValue((current) => (el.value === current ? current : el.value));
  }, []);

  React.useEffect(() => {
    const frame = requestAnimationFrame(syncFromNative);
    return () => cancelAnimationFrame(frame);
  }, [syncFromNative, children]);

  /* Usage contrôlé (barre de filtres) : la valeur vient du parent. */
  React.useEffect(() => {
    if (controlledValue === undefined) return;
    const next = String(controlledValue);
    const el = nativeRef.current;
    if (el && el.value !== next) el.value = next;
    setValue((current) => (current === next ? current : next));
  }, [controlledValue]);

  React.useEffect(() => {
    if (!open) return;
    setActive(currentIndex);
    function onPointerDown(event: PointerEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, currentIndex]);

  function commit(next: string) {
    const el = nativeRef.current;
    setValue(next);
    setOpen(false);
    if (el && el.value !== next) {
      el.value = next;
      // l'événement natif déclenche le onChange de react-hook-form
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
    triggerRef.current?.focus();
  }

  function onTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    const last = options.length - 1;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActive((index) => {
        const next = event.key === "ArrowDown" ? index + 1 : index - 1;
        return Math.min(last, Math.max(0, next));
      });
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!open) setOpen(true);
      else {
        const option = options[active];
        if (option) commit(option.value);
      }
      return;
    }
    if (event.key === "Escape") setOpen(false);
    if (event.key === "Home") {
      setActive(0);
      setOpen(true);
    }
    if (event.key === "End") {
      setActive(last);
      setOpen(true);
    }
  }

  return (
    <div ref={wrapRef} className="relative w-full">
      <select
        {...props}
        ref={nativeRef}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        defaultValue={defaultValue}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      >
        {children}
      </select>

      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={props["aria-label"] ?? props.name}
        disabled={disabled}
        onClick={() => {
          syncFromNative();
          setOpen((current) => !current);
        }}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "focus-ring flex h-10 w-full items-center justify-between gap-2 rounded-xl border bg-white px-3 text-left text-sm font-medium text-ink transition",
          open
            ? "border-coral/60 shadow-[0_0_0_3px_rgba(239,69,59,0.14)]"
            : "border-ink/12 hover:border-ink/30",
          disabled && "opacity-60",
          className
        )}
      >
        <span className={cn("truncate", selected ? "text-ink" : "text-ink/35")}>
          {selected?.label ?? "—"}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition",
            open ? "rotate-180 text-coral" : "text-ink/40"
          )}
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 top-[calc(100%+6px)] z-50 max-h-64 min-w-full overflow-auto rounded-xl border border-ink/10 bg-white p-1 shadow-[0_18px_38px_rgba(18,43,67,0.18)]"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value + index}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => commit(option.value)}
                  className={cn(
                    "flex w-full items-center gap-2 whitespace-nowrap rounded-lg px-2.5 py-2 text-left text-[13px] transition",
                    isSelected
                      ? "bg-coral font-semibold text-white"
                      : index === active
                        ? "bg-ink/6 text-ink"
                        : "text-ink/75"
                  )}
                >
                  <span className="flex-1 truncate">{option.label}</span>
                  {isSelected ? <Check className="size-3.5 shrink-0" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
});
Select.displayName = "Select";

export function Label({
  className,
  children,
  htmlFor,
}: {
  className?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.09em] text-ink/55", className)}
    >
      {children}
    </label>
  );
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-[11px] font-medium text-rose-600">{children}</p>;
}
