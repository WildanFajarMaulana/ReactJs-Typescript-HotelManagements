import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HotelPage from "./pages/HotelPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyProfilePage from "./pages/MyProfilePage";
import HistoryReservationPage from "./pages/HistoryReservationPage";
import ReservationPage from "./pages/ReservationPage";
import DetailPage from "./pages/DetailPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HotelPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/my-profile" element={<MyProfilePage />} />
          <Route
            path="/history-reservation"
            element={<HistoryReservationPage />}
          />
          <Route path="/reservation" element={<ReservationPage />} />
          <Route path="/room/:slug" element={<DetailPage />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
