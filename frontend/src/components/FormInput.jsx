import { useId } from "react"
import clsx from "clsx"

export default function FormInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
}) {
  const id = useId()

  return (
    <div className="flex flex-col mb-6">

      {/* Label */}
      <label
        htmlFor={id}
        className="text-sm font-semibold text-[#1e3231] mb-2"
      >
        {label}
      </label>

      {/* Input */}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={clsx(
          "w-full px-4 py-3 text-base rounded-lg",
          "border-2 transition-all duration-200 bg-white",
          error
            ? "border-red-500 bg-red-50"
            : "border-gray-300 focus:border-[#deb986] focus:ring-2 focus:ring-[#deb986]/20",
          "outline-none"
        )}
      />

      {/* Error */}
      {error && (
        <p className="text-sm text-red-700 mt-2">
          {error}
        </p>
      )}
    </div>
  )
}