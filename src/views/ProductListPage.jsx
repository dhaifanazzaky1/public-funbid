import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import api from "../lib/api.js";
import socket from "../lib/socket.js";
import Preloader from "../component/Preloader.jsx";
import ProductCard from "../component/ProductCard.jsx";

export default function ProductListPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const joinedIdsRef = useRef([]);

  const [now, setNow] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products");
      setProducts(data.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        toast.error("Sesi berakhir, silakan login ulang");
        navigate("/login");
      } else {
        toast.error(error.response?.data?.message || "Gagal memuat produk");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    fetchProducts();

  }, []);


  useEffect(() => {
    if (products.length === 0) return;

    socket.connect();

    const currentIds = products.map((p) => p.id);

    const joinAll = () => {
      currentIds.forEach((pid) => socket.emit("joinProduct", pid));
    };

    socket.on("connect", joinAll);
    if (socket.connected) joinAll();

    const handleAuctionStarted = (payload) => {
      setProducts((prev) =>
        prev.map((p) =>
          Number(p.id) === Number(payload.productId) ? { ...p, status: "live" } : p
        )
      );
    };

    const handleAuctionEnded = (payload) => {
      setProducts((prev) =>
        prev.map((p) =>
          Number(p.id) === Number(payload.productId)
            ? { ...p, status: "ended", current_price: payload.finalPrice }
            : p
        )
      );
    };

    const handleNewBid = (payload) => {
      setProducts((prev) =>
        prev.map((p) =>
          Number(p.id) === Number(payload.productId)
            ? { ...p, current_price: payload.currentPrice }
            : p
        )
      );
    };

    socket.on("auctionStarted", handleAuctionStarted);
    socket.on("auctionEnded", handleAuctionEnded);
    socket.on("newBid", handleNewBid);

    joinedIdsRef.current = currentIds;

    return () => {
      joinedIdsRef.current.forEach((pid) => socket.emit("leaveProduct", pid));
      socket.off("connect", joinAll);
      socket.off("auctionStarted", handleAuctionStarted);
      socket.off("auctionEnded", handleAuctionEnded);
      socket.off("newBid", handleNewBid);
      socket.disconnect();
    };

  }, [products.length]);

  const liveCount = products.filter((p) => p.status === "live").length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
          Daftar Lelang
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {liveCount} lelang sedang berlangsung. Klik kartu untuk ikut bidding!
        </p>
      </div>

      {loading ? (
        <Preloader label="Memuat lelang..." />
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
          Belum ada produk lelang.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}