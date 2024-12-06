import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Navbar = ({ isScrolled }: any) => {
  const { logout } = useAuth(); // Ambil fungsi logout dari AuthContext
  const navigate = useNavigate(); // Untuk navigasi
  const location = useLocation(); // Mengambil lokasi halaman saat ini
  const [isProfilePage, setIsProfilePage] = useState(false);

  useEffect(() => {
    // Memeriksa apakah kita berada di halaman /my-profile
    if (location.pathname === "/my-profile") {
      setIsProfilePage(true);
    } else {
      setIsProfilePage(false);
    }
  }, [location.pathname]);

  // Mengecek apakah kita berada di halaman Home
  const isHomePage = location.pathname === "/";

  const handleLogout = () => {
    logout();
    toast.success("Successfully logged out!");
    navigate("/login");
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 py-6 transition-all duration-300 ease-in-out ${
        isProfilePage ? "bg-gray-900" : isScrolled ? "bg-gray-900" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
        <a
          href="/"
          className="text-4xl font-extrabold text-orange-600 hover:text-orange-800 transition-all"
        >
          HotelLux
        </a>
        <ul className="flex space-x-8 text-lg font-medium">
          <li>
            <Link
              to="/"
              className={`${
                isScrolled ? "text-white" : "text-white"
              } hover:text-orange-600 transition-all`}
            >
              Home
            </Link>
          </li>

          {/* Menyembunyikan menu Rooms jika bukan di halaman Home */}
          {isHomePage && (
            <li>
              <a
                href="#rooms"
                className={`${
                  isScrolled ? "text-white" : "text-white"
                } hover:text-orange-600 transition-all`}
              >
                Rooms
              </a>
            </li>
          )}

          <li>
            <Link
              to="/my-profile"
              className={`${
                isScrolled ? "text-white" : "text-white"
              } hover:text-orange-600 transition-all`}
            >
              My Profile
            </Link>
          </li>

          <button
            onClick={handleLogout}
            className={`${
              isScrolled ? "text-white" : "text-white"
            } hover:text-orange-600 transition-all`}
          >
            Logout
          </button>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
