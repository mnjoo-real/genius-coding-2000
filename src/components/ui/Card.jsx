const paddingClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({ children, className = '', onClick, padding = 'md', ...props }) {
  const clickable = typeof onClick === 'function';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-stone-200 ${paddingClasses[padding] ?? paddingClasses.md} ${clickable ? 'cursor-pointer hover:bg-moss/20 transition-base' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
