import clsx from "clsx"

export default function Button({
  children,
  type = "button",
  loading = false,
  disabled = false,
  className = "",
}) {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      className={clsx(
        "w-full py-3 px-6 rounded-lg",
        "bg-[#deb986] text-[#1e3231] font-bold text-base",
        "transition-all duration-200",
        "shadow-md hover:bg-[#d4a876] hover:shadow-lg",
        "active:bg-[#c99866]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {loading ? "Signing in..." : children}
    </button>
  )
}