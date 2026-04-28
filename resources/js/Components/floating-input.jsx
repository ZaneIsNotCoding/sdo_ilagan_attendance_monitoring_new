import { Input } from "@/components/ui/input";

export default function FloatingInput({
    label,
    icon: Icon,
    name,
    value,
    onChange,
    readOnly = false,
}) {
    return (
        <div className="relative w-full">
            <div
                className="flex items-center border border-gray-300 rounded-md px-2 py-0.5 bg-gray-50
                focus-within:ring-2 focus-within:ring-blue-500 transition relative"
            >
                {Icon && <Icon className="text-gray-400 w-4 h-4 mr-2" />}

                <Input
                    type="text"
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    placeholder=" "
                    className="peer border-0 shadow-none bg-transparent text-sm text-gray-700
                        placeholder-transparent focus-visible:ring-0 h-7"
                />

                <label
                    htmlFor={name}
                    className={`absolute transition-all pointer-events-none
                        ${
                            value
                                ? "-top-1.5 left-8 text-xs text-blue-600"
                                : "top-1/2 -translate-y-1/2 left-8 text-sm text-gray-400"
                        }
                        peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:left-8
                        peer-focus:-top-1.5 peer-focus:left-8 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-blue-600
                        bg-gray-50 px-1`}
                >
                    {label}
                </label>
            </div>
        </div>
    );
}
