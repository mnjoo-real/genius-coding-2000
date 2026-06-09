const variantClasses = {
  primary: 'bg-leaf text-white border border-transparent hover:bg-forest',
  secondary: 'bg-transparent text-leaf border border-leaf hover:bg-moss',
  danger: 'bg-red-600 text-white border border-transparent hover:bg-red-700',
  ghost: 'bg-transparent text-stone-700 border border-transparent hover:bg-moss hover:text-forest',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm rounded',
  md: 'px-4 py-2 text-base rounded-md',
  lg: 'px-6 py-3 text-base rounded-lg',
};


export default function Button({
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  fullWidth = false,
  children,
  type = 'button',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center font-medium transition-fast',
        variantClasses[variant] ?? variantClasses.primary,
        sizeClasses[size] ?? sizeClasses.md,
        disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer',
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
