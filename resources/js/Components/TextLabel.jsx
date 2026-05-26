export default function TextLabel({ label, value = '\u00A0' }) {
    return (
        <div className="flex items-center space-x-2 w-full">
            <span className="text-sm font-medium text-gray-700 min-w-[150px]">{label}</span>
            <div className="flex-1 border border-black px-4 py-2 rounded-md bg-white min-h-[2.5rem]">
                {value}
            </div>
        </div>
    );
}

