

import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";

import BaseLayout from "./component/BaseLayout.jsx";
import LoginPage from "./views/LoginPage.jsx";
import RegisterPage from "./views/RegisterPage.jsx";
import ProductListPage from "./views/ProductListPage.jsx";
import ProductDetailPage from "./views/ProductDetailPage.jsx";

function App() {
  return (
    <>
      <Toaster position="bottom-left" reverseOrder={false} />

      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Halaman di bawah ini dilindungi: wajib login */}
          <Route element={<BaseLayout />}>
            <Route path="/" element={<ProductListPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
