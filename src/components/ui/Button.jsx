const variants = {
  primary: 'bg-brand-blue text-white hover:bg-brand-blue-dark',
  accent: 'bg-brand-orange text-white hover:bg-brand-orange-dark',
  outline: 'border border-brand-blue text-brand-blue hover:bg-blue-50',
  ghost: 'text-brand-blue hover:bg-blue-50',
}

function Button({ children, type = 'button', variant = 'primary', className = '', ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
