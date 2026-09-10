function Input({ label, id, error, labelAction, className = '', ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor={id} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          {labelAction}
        </div>
      )}
      <input
        id={id}
        className={`w-full px-4 py-2.5 rounded-lg border ${
          error ? 'border-red-400' : 'border-gray-300'
        } text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default Input
