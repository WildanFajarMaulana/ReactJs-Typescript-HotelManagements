import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  // Handler scroll untuk navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isLoggedIn = !!user; // Pastikan user tidak null atau undefined

  return (
    <>
      {isLoggedIn ? (
        <>
          <Navbar isScrolled={isScrolled} />
          <Outlet />
          <Footer />
        </>
      ) : (
        <Outlet />
      )}
    </>
  );
};

export default Layout;
