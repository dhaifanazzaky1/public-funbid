import { useNavigate } from "react-router";
import StatusBadge from "./StatusBadge.jsx";
import { formatRupiah, formatRemaining } from "../lib/format.js";

export default function ProductCard({ product, now }) {
  const navigate = useNavigate();

  const endTime = product?.end_time ? new Date(product.end_time).getTime() : 0;
  const remaining = Math.max(0, endTime - now);

  return (
    <button
      type="button"
      onClick={() => navigate(`/products/${product.id}`)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg"
    >
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={product.image_url}
          alt={product.name}
          className="h-full w-full object-cover transition group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/600x400?text=No+Image";
          }}
        />
        <div className="absolute left-3 top-3">
          <StatusBadge status={product.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 font-semibold text-slate-800">
          {product.name}
        </h3>

        <div className="mt-2 flex items-baseline justify-between">
          <div>
            <p className="text-xs text-slate-400">Harga Saat Ini</p>
            <p className="text-lg font-bold text-indigo-600">
              {formatRupiah(product.current_price)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
          <span>Berakhir dalam</span>
          <span className="font-semibold text-slate-700 tabular-nums">
            {product.status === "ended"
              ? "-"
              : formatRemaining(remaining)}
          </span>
        </div>
      </div>
    </button>
  );
}