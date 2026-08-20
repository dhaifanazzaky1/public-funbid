// Tombol reusable dengan gaya konsisten + opsi loading spinner
export default function Button({
  children,
  type = "button",
  onClick,
  disabled = false,
  loading = false,
  variant = "primary",
  size = "md",
  className = "",
}) {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-slate-200 text-slate-800 hover:bg-slate-300",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition
        focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1
        disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}