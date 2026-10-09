export interface SkinOption<T extends string> {
    id: T;
    label: string;
}

export default function SkinTabs<T extends string>({
    label,
    options,
    value,
    onChange,
}: {
    label: string;
    options: SkinOption<T>[];
    value: T;
    onChange?: (value: T) => void;
}) {
    return <div role="radiogroup" aria-label={label} className="inline-flex border border-ink font-mono text-[10px] uppercase tracking-[0.12em]">
        {options.map((option, index) => {
            const selected = option.id === value;
            return <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={!onChange}
                onClick={() => onChange?.(option.id)}
                className={[
                    "px-3 py-2 transition-colors duration-200 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-signal",
                    index > 0 ? "border-l border-ink" : "",
                    selected ? "bg-ink text-paper" : "text-ink hover:bg-paper-deep",
                ].join(" ")}
            >
                {option.label}
            </button>;
        })}
    </div>;
}
