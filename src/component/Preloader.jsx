// Preloader / spinner untuk state loading
export function Spinner({ className = "" }) {
  return (
    <svg
      className={`h-6 w-6 animate-spin text-indigo-600 ${className}`}
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
  );
}

export default function Preloader({ label = "Memuat..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500">
      <Spinner className="h-10 w-10" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}