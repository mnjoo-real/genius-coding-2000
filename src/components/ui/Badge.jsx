const variantClasses = {
  success: 'bg-leaf/15 text-forest border-leaf/30',
  warning: 'bg-amber-100 text-amber-800 border-amber-300',
  danger:  'bg-red-100 text-red-700 border-red-300',
  info:    'bg-sky-100 text-sky-700 border-sky-300',
  neutral: 'bg-stone-100 text-stone-600 border-stone-300',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export default function Badge({ variant = 'neutral', size = 'md', children, className = '', ...props }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium leading-none ${variantClasses[variant] ?? variantClasses.neutral} ${sizeClasses[size] ?? sizeClasses.md} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
