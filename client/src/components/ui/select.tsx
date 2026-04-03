import { cn } from "../../lib/utils";

type SelectProps = {
  className?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
};

export function Select({ className, value, onChange, options }: SelectProps): JSX.Element {
  return (
    <div className={cn("relative", className)}>
      <select
        className="h-10 w-full rounded-xl border border-slate-600/60 bg-[#071523]/85 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/30"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
