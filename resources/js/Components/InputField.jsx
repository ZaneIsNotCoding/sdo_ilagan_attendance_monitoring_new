import InputLabel from './InputLabel';
import TextInput from './TextInput';

export default function InputField({
    label,
    name,
    value,
    onChange,
    type = 'text',
    placeholder = '',
    error = '',
    required = false,
    isFocused = false,
    className = '',
}) {
    return (
        <div className="mb-4">
            <InputLabel htmlFor={name} value={label} />

            <TextInput
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                type={type}
                placeholder={placeholder}
                isFocused={isFocused}
                className={`mt-1 block w-full ${className}`}
            />

            {error && (
                <p className="mt-1 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

