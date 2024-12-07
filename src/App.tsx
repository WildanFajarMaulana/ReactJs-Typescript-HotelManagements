import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HotelPage from "./pages/HotelPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyProfilePage from "./pages/MyProfilePage";
import ReservationPage from "./pages/ReservationPage";
import DetailPage from "./pages/DetailPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "./context/AuthContext";
import Layout from "./layout/Layout";

// Definisikan tipe untuk props children
interface NotLoginProps {
  children: React.ReactNode;
}

// Komponen untuk akses halaman jika user belum login
const NotLogin: React.FC<NotLoginProps> = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/" replace={true} />; // Redirect ke halaman utama jika sudah login
  }
  return <>{children}</>;
};

// Komponen untuk akses halaman yang hanya bisa diakses setelah login
const PrivateRoute: React.FC<NotLoginProps> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace={true} />; // Redirect ke halaman login jika belum login
  }
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Halaman utama yang dapat diakses oleh semua orang */}
          <Route
            index
            element={
              <PrivateRoute>
                <HotelPage />
              </PrivateRoute>
            }
          />

          {/* Halaman yang hanya bisa diakses setelah login */}
          <Route
            path="/my-profile"
            element={
              <PrivateRoute>
                <MyProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/reservation"
            element={
              <PrivateRoute>
                <ReservationPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/room/:slug"
            element={
              <PrivateRoute>
                <DetailPage />
              </PrivateRoute>
            }
          />

          {/* Halaman Login dan Register hanya dapat diakses jika belum login */}
          <Route
            path="/login"
            element={
              <NotLogin>
                <LoginPage />
              </NotLogin>
            }
          />
          <Route
            path="/register"
            element={
              <NotLogin>
                <RegisterPage />
              </NotLogin>
            }
          />
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
