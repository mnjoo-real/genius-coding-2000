export default function Textarea({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  rows = 4,
  required = false,
  className = '',
  ...props
}) {
  const textareaId = label ? label.toLowerCase().replace(/\s+/g, '-') : undefined;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-stone-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        rows={rows}
        className={[
          'w-full rounded-lg border bg-white px-3 py-2 text-stone-900 placeholder:text-stone-400 transition-base resize-y',
          error ? 'border-red-400' : 'border-stone-300',
          disabled ? 'cursor-not-allowed opacity-50 bg-stone-50' : '',
        ].join(' ')}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
