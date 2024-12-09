import React, { useState, useEffect } from "react";
import { fetchRoomsService } from "../services/apiService";
import { BASE_URL_STORAGE, formatCurrency } from "../utils/utils";
import { Link } from "react-router-dom";
import { Room } from "../types/type";

const HotelPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // State untuk loading

  useEffect(() => {
    const loadRooms = async () => {
      setLoading(true); // Menyatakan bahwa data sedang dimuat
      try {
        const fetchedRooms = await fetchRoomsService();
        setRooms(fetchedRooms.data.data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setLoading(false); // Set loading menjadi false setelah data berhasil atau gagal diambil
      }
    };

    loadRooms();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <section
        className="relative h-screen bg-cover bg-center"
        style={{
          backgroundImage: `url('https://plus.unsplash.com/premium_photo-1661929519129-7a76946c1d38?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
        }}
      >
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4">
          <div>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Experience Luxury Like Never Before
            </h1>
            <p className="text-2xl mb-8">
              Indulge in the most exclusive stays and world-class services.
            </p>
            <a
              href="#rooms"
              className="bg-orange-600 text-white py-3 px-6 text-lg font-semibold rounded-full hover:bg-orange-700 transition-all duration-300"
            >
              Book Your Stay Now
            </a>
          </div>
        </div>
      </section>

      {/* Room Section */}
      <section
        id="rooms"
        className="py-24 bg-white px-6 sm:px-12 md:px-24 max-w-7xl mx-auto text-center"
      >
        <h2 className="text-4xl font-semibold text-gray-800 mb-16">
          Our Exclusive Rooms
        </h2>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-solid border-orange-600 rounded-full" role="status">
              <span className="visually-hidden"></span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {/* Dynamically Render Rooms */}
            {rooms.map((room: any) => (
              <div
                key={room.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden transition-all transform hover:scale-105 hover:shadow-xl"
              >
                <div className="relative group">
                  <img
                    src={`${BASE_URL_STORAGE}/${room.image_url}`}
                    alt={room.room_name}
                    className="w-full h-64 object-cover transition-all group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-0 transition-opacity"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                    {room.room_type} / {room.room_name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{room.status}</p>
                  <p className="text-xl font-semibold text-gray-800 mb-4">
                    {formatCurrency(room.price_per_night)} / night
                  </p>
                  <Link
                    to={`/room/${room.room_slug}`} // Pastikan slug digunakan
                    className="bg-orange-600 text-white py-2 px-6 rounded-full hover:bg-orange-700 transition-all duration-300"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HotelPage;
