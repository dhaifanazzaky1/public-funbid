// Badge warna berbeda untuk status lelang
const STYLES = {
  upcoming: "bg-amber-100 text-amber-700",
  live: "bg-emerald-100 text-emerald-700",
  ended: "bg-slate-200 text-slate-600",
};

const LABELS = {
  upcoming: "Akan Datang",
  live: "Live",
  ended: "Selesai",
};

export default function StatusBadge({ status = "" }) {
  const key = status || "upcoming";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${STYLES[key]}`}
    >
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[key] || key}
    </span>
  );
}