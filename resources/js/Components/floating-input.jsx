import { Input } from "@/components/ui/input";

export default function FloatingInput({
    label,
    icon: Icon,
    name,
    value,
    onChange,
    onKeyDown,
    onFocus,
    onBlur,
    type = "text",
    readOnly = false,
    disabled = false,
    inputClassName = "",
}) {
    const labelOffsetClasses = Icon
        ? "left-8 peer-placeholder-shown:left-8 peer-focus:left-8"
        : "left-3 peer-placeholder-shown:left-3 peer-focus:left-3";

    return (
        <div className="relative w-full">
            <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-1.5 shadow-sm transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
                {Icon && <Icon className="mr-2 h-4 w-4 text-slate-400" />}

                <Input
                    type={type}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    readOnly={readOnly}
                    disabled={disabled}
                    placeholder=" "
                    className={`peer h-6 min-w-0 border-0 bg-transparent px-0 text-sm text-slate-700 shadow-none placeholder-transparent focus-visible:ring-0 disabled:text-slate-400 ${inputClassName}`}
                />

                <label
                    htmlFor={name}
                    className={`absolute transition-all pointer-events-none
                        ${labelOffsetClasses}
                        ${
                            value
                                ? "-top-2 text-[11px] font-medium text-blue-600"
                                : "top-1/2 -translate-y-1/2 text-sm text-slate-400"
                        }
                        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2
                        peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:font-medium peer-focus:text-blue-600
                        bg-slate-50 px-1 peer-focus:bg-white`}
                >
                    {label}
                </label>
            </div>
        </div>
    );
}
