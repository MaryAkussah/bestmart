const variants = {
  primary: 'bg-violet-600 text-white hover:bg-violet-700',
  outline: 'border border-violet-600 text-violet-600 hover:bg-violet-50',
  ghost: 'text-violet-600 hover:bg-violet-50',
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
