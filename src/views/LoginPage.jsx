import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import toast from "react-hot-toast";
import api from "../lib/api.js";
import Button from "../component/Button.jsx";

function Input({ label, type = "text", name, value, onChange, autoComplete, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
    </label>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);


  if (localStorage.getItem("token")) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/login", form);
      localStorage.setItem("token", data.access_token);
      toast.success("Login berhasil!");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Login gagal, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <svg
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Selamat Datang di FunBid
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Masuk untuk mulai ikut lelang favoritmu
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder="contoh@email.com"
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            loading={loading}
            disabled={loading}
            className="mt-6 w-full"
          >
            {loading ? "Memproses..." : "Masuk"}
          </Button>

          <p className="mt-4 text-center text-sm text-slate-500">
            Belum punya akun?{" "}
            <span
              role="button"
              tabIndex={0}
              onClick={() => navigate("/register")}
              onKeyDown={(e) => e.key === "Enter" && navigate("/register")}
              className="cursor-pointer font-semibold text-indigo-600 hover:underline"
            >
              Daftar di sini
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}