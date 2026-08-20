import { useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import api from "../lib/api.js";
import Button from "../component/Button.jsx";

function Field({ label, type = "text", name, value, onChange, placeholder, required = true }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
    </label>
  );
}

const emptyForm = {
  name: "",
  email: "",
  password: ""
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/register", form);
      toast.success("Registrasi berhasil! Silakan login");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registrasi gagal, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-white px-4 py-10">
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
          <h1 className="text-2xl font-bold text-slate-800">Buat Akun Baru</h1>
          <p className="mt-1 text-sm text-slate-500">
            Daftar supaya bisa mengikuti lelang
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="space-y-4">
            <Field
              label="Nama Lengkap"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Budi Santoso"
            />
            <Field
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="contoh@email.com"
            />
            <Field
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
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
            {loading ? "Mendaftarkan..." : "Daftar"}
          </Button>

          <p className="mt-4 text-center text-sm text-slate-500">
            Sudah punya akun?{" "}
            <span
              role="button"
              tabIndex={0}
              onClick={() => navigate("/login")}
              onKeyDown={(e) => e.key === "Enter" && navigate("/login")}
              className="cursor-pointer font-semibold text-indigo-600 hover:underline"
            >
              Masuk di sini
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}