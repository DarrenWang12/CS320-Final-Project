export function Button({ variant, size, className = '', children, ...props }) {
  const base = size === 'icon'
    ? 'inline-flex items-center justify-center rounded-md p-2'
    : 'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium'

  const variantClasses = variant === 'ghost'
    ? 'bg-transparent hover:bg-gray-100'
    : ''

  return (
    <button className={`${base} ${variantClasses} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}

export default Button
