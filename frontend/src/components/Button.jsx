export default function Button({ children, loading, loadingText, type = 'submit', onClick, variant = 'primary' }) {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`w-full py-2 rounded-lg font-medium disabled:opacity-50 transition-colors ${variants[variant]}`}
    >
      {loading ? loadingText : children}
    </button>
  )
}