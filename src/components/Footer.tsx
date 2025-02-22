const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto text-center">
        <p>&copy; 2024 HotelDer. All rights reserved.</p>
        <div className="mt-4">
          <a href="/" className="text-gray-400 hover:text-white">
            Privacy Policy
          </a>{" "}
          |{" "}
          <a href="/" className="text-gray-400 hover:text-white">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
