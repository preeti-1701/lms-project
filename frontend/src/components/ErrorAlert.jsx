export default function ErrorAlert({ message }) {
  if (!message) return null
  return (
    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
      {message}
    </div>
  )
}