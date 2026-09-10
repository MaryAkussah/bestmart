import { HiEye, HiEyeSlash } from 'react-icons/hi2'

function Input({ label, id, error, labelAction, className = '', type, onToggleVisibility, ...props }) {
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
      <div className="relative">
        <input
          id={id}
          type={type}
          className={`w-full px-4 py-2.5 ${onToggleVisibility ? 'pr-11' : ''} rounded-lg border ${
            error ? 'border-red-400' : 'border-gray-300'
          } text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition ${className}`}
          {...props}
        />
        {onToggleVisibility && (
          <button
            type="button"
            onClick={onToggleVisibility}
            aria-label={type === 'text' ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          >
            {type === 'text' ? <HiEyeSlash size={18} /> : <HiEye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default Input
