import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import api from "../lib/api.js";
import socket from "../lib/socket.js";
import Button from "../component/Button.jsx";
import Preloader from "../component/Preloader.jsx";
import StatusBadge from "../component/StatusBadge.jsx";
import { formatRupiah, formatRemaining } from "../lib/format.js";

const decisionLabel = {
  merah: "Jangan",
  kuning: "Tergantung",
  hijau: "Worth It",
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);


  const [status, setStatus] = useState("upcoming");
  const [price, setPrice] = useState("0");
  const [winner, setWinner] = useState(null);

  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);


  const [aiAdvice, setAiAdvice] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);


  const [now, setNow] = useState(0);



  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const endTime = product?.end_time ? new Date(product.end_time).getTime() : 0;
  const remaining = Math.max(0, endTime - now);
  const isExpired = remaining <= 0;


  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [prodRes, bidRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/${id}/bids`),
        ]);

        const p = prodRes.data.data;
        setProduct(p);
        setStatus(p.status);
        setPrice(p.current_price);
        if (p.winner) setWinner(p.winner);
        setBids(bidRes.data.data || []);
        setAiAdvice(null);
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          toast.error("Sesi berakhir, silakan login ulang");
          navigate("/login");
        } else {
          toast.error(error.response?.data?.message || "Gagal memuat detail produk");
        }
      } finally {
        setLoading(false);
      }
    };
    load();

  }, [id]);

  // ---------- socket realtime ----------
  useEffect(() => {
    socket.connect();

    const handleConnect = () => {
      socket.emit("joinProduct", id);
    };

    socket.on("connect", handleConnect);


    socket.on("newBid", (payload) => {
      if (Number(payload.productId) !== Number(id)) return;

      setPrice(payload.currentPrice);
      setBids((prev) => {
        const exists = prev.some((b) => Number(b.id) === Number(payload.bid?.id));
        if (exists) return prev;
        return [payload.bid, ...prev];
      });
    });


    socket.on("auctionStarted", (payload) => {
      if (Number(payload.productId) !== Number(id)) return;

      setStatus("live");
      toast.success("Lelang telah dimulai!");
    });


    socket.on("auctionEnded", (payload) => {
      if (Number(payload.productId) !== Number(id)) return;

      setStatus("ended");
      setPrice(payload.finalPrice);
      setWinner(payload.winner);
      toast.success("Lelang telah berakhir!");
    });

    return () => {
      socket.emit("leaveProduct", id);
      socket.off("connect", handleConnect);
      socket.off("newBid");
      socket.off("auctionStarted");
      socket.off("auctionEnded");
      socket.disconnect();
    };
  }, [id]);


  const minimumBid = Number(price) + Number(product?.bid_increment || 0);
  const isLive = status === "live" && !isExpired;

  const handleBid = async (e) => {
    e.preventDefault();
    const num = Number(amount);
    if (!amount || Number.isNaN(num) || num < minimumBid) {
      toast.error(`Bid minimal ${formatRupiah(minimumBid)}`);
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/products/${id}/bids`, { amount: num });
      toast.success("Bid berhasil dipasang!");
      setAmount("");

    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        toast.error("Sesi berakhir, silakan login ulang");
        navigate("/login");
      } else {
        toast.error(error.response?.data?.message || "Gagal memasang bid");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAiSuggest = async () => {
    setAiLoading(true);
    try {
      const res = await api.get(`/products/${id}/bid-advice`);
      setAiAdvice(res.data.data.options);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        toast.error("Sesi berakhir, silakan login ulang");
        navigate("/login");
      } else {
        toast.error(error.response?.data?.message || "Gagal mendapatkan saran AI");
      }
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <Preloader label="Memuat detail produk..." />;
  }

  if (!product) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
        Produk tidak ditemukan.
      </div>
    );
  }




  const displayWinner = winner || product.winner || null;
  return (
    <div className="space-y-8">
      <button
        type="button"
        onClick={() => navigate("/")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke daftar lelang
      </button>

      <div className="grid gap-6 lg:grid-cols-2">

        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <img
              src={product.image_url}
              alt={product.name}
              className="h-72 w-full object-cover sm:h-96"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/600x400?text=No+Image";
              }}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-slate-800">{product.name}</h1>
              <StatusBadge status={status} />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {product.description || "Tidak ada deskripsi."}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <Info label="Harga Awal" value={formatRupiah(product.starting_price)} />
              <Info label="Kenaikan Minimal" value={formatRupiah(product.bid_increment)} />
              <Info label="Harga Saat Ini" value={formatRupiah(price)} highlight />
              <Info
                label="Berakhir Dalam"
                value={status === "ended" ? "Selesai" : formatRemaining(remaining)}
                highlight={isLive}
              />
            </div>
          </div>
        </div>


        <div className="space-y-6">

          {status === "ended" && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
                🏆 Lelang Selesai
              </p>
              <p className="mt-1 text-slate-700">
                {displayWinner ? (
                  <>
                    Pemenang:{" "}
                    <span className="font-bold text-slate-900">
                      {displayWinner.name}
                    </span>{" "}
                    dengan bid{" "}
                    <span className="font-bold text-amber-700">
                      {formatRupiah(price)}
                    </span>
                  </>
                ) : (
                  "Tidak ada pemenang (tidak ada bid)."
                )}
              </p>
            </div>
          )}


          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Pasang Bid</h2>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${isLive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}
              >
                {isLive ? "● Terbuka" : status === "live" ? "Waktu habis" : "Tertutup"}
              </span>
            </div>

            <form onSubmit={handleBid} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Nominal Bid (minimal{" "}
                  <span className="font-semibold text-indigo-600">
                    {formatRupiah(minimumBid)}
                  </span>
                  )
                </span>
                <input
                  type="number"

                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={!isLive}
                  placeholder={`Minimal ${formatRupiah(minimumBid)}`}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </label>

              <Button
                type="submit"
                size="lg"
                loading={submitting}
                disabled={!isLive || submitting}
                className="w-full"
              >
                {!isLive
                  ? status === "ended"
                    ? "Lelang Selesai"
                    : status === "live"
                      ? "Waktu Habis"
                      : "Belum Dibuka"
                  : submitting
                    ? "Memasang bid..."
                    : "Pasang Bid"}
              </Button>
            </form>

            {!isLive && status === "live" && (
              <p className="mt-3 text-center text-xs text-slate-400">
                Waktu lelang sudah habis.
              </p>
            )}


            <div className="mt-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                loading={aiLoading}
                disabled={status !== "live" || aiLoading}
                onClick={handleAiSuggest}
                className="w-full"
              >
                {status !== "live"
                  ? "AI Suggest (hanya saat lelang live)"
                  : aiLoading
                    ? "Menganalisa..."
                    : "✨ AI Suggest"}
              </Button>
            </div>

            {aiAdvice && (
              <div
                className={`mt-4 rounded-xl border p-4 ${aiAdvice.decision === "hijau"
                  ? "border-emerald-200 bg-emerald-50"
                  : aiAdvice.decision === "kuning"
                    ? "border-amber-200 bg-amber-50"
                    : "border-red-200 bg-red-50"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-3 w-3 shrink-0 rounded-full ${aiAdvice.decision === "hijau"
                      ? "bg-emerald-500"
                      : aiAdvice.decision === "kuning"
                        ? "bg-amber-500"
                        : "bg-red-500"
                      }`}
                  />
                  <p
                    className={`text-sm font-bold ${aiAdvice.decision === "hijau"
                      ? "text-emerald-700"
                      : aiAdvice.decision === "kuning"
                        ? "text-amber-700"
                        : "text-red-700"
                      }`}
                  >
                    {decisionLabel[aiAdvice.decision] || aiAdvice.decision}
                  </p>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {aiAdvice.reason}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-800">
              Riwayat Bid{" "}
              <span className="ml-1 text-sm font-medium text-slate-400">
                ({bids.length})
              </span>
            </h2>

            {bids.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">
                Belum ada bid. Jadilah yang pertama!
              </p>
            ) : (
              <ul className="max-h-96 space-y-2 overflow-y-auto pr-1">
                {bids.map((bid, index) => (
                  <li
                    key={bid.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${index === 0 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
                          }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {bid.User?.name || "Bidder"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {bid.createdAt ? new Date(bid.createdAt).toLocaleString("id-ID") : ""}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-sm font-bold ${index === 0 ? "text-indigo-600" : "text-slate-700"
                        }`}
                    >
                      {formatRupiah(bid.amount)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, highlight = false }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p
        className={`mt-0.5 text-base font-bold ${highlight ? "text-indigo-600" : "text-slate-800"
          }`}
      >
        {value}
      </p>
    </div>
  );
}