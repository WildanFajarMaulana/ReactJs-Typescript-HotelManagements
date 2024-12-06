import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  fetchHistoryReservationsService,
  fetchRoomBySlugService,
} from "../services/apiService";
import { BASE_URL_STORAGE, formatCurrency } from "../utils/utils";
import { Reservation, Room } from "../types/type";
import { useAuth } from "../context/AuthContext";

const DetailPage = () => {
  const { user } = useAuth();
  const { slug } = useParams<{ slug: string }>(); // Mendapatkan slug dari URL
  const [room, setRoom] = useState<Room | null>(null); // Menambahkan tipe Room
  const [loading, setLoading] = useState(true); // State untuk loading
  const [error, setError] = useState<string>(""); // State untuk error handling
  const navigate = useNavigate(); // Untuk redirect halaman

  const [reservations, setReservations] = useState<Reservation[]>([]); // Menambahkan tipe untuk reservasi
  const [canBook, setCanBook] = useState(true); // Default bisa pesan

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetchHistoryReservationsService();
        setReservations(response.data.reservations);
        checkCanBook(response.data.reservations);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };

    if (user?.data?.user.id) {
      fetchReservations();
    }
  }, [user?.data?.user.id]);

  // Mengecek apakah pemesanan pertama sudah selesai
  const checkCanBook = (reservations: Reservation[]) => {
    const activeReservation = reservations.find(
      (reservation) => reservation.reservation_status !== "completed" && reservation.reservation_status !== "canceled"
    );
    if (activeReservation) {
      setCanBook(false); // Tidak bisa pesan jika ada pesanan yang belum selesai
    } else {
      setCanBook(true); // Bisa pesan jika tidak ada pesanan yang sedang berlangsung
    }
  };
  console.log(canBook);
  useEffect(() => {
    const loadRoomDetails = async () => {
      try {
        setLoading(true);
        const response = await fetchRoomBySlugService(slug);
        setRoom(response.data.data);
        setError("");
      } catch (err) {
        setError("Room not found or an error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadRoomDetails();
    }
  }, [slug]);

  // Fungsi untuk menangani tombol "Book Now"
  const handleBookNow = () => {
    if (room) {
      // Simpan data kamar ke localStorage
      localStorage.setItem(
        "reservation",
        JSON.stringify({
          id: room.id,
          room_type: room.room_type,
          price: room.price_per_night,
          capacity: room.capacity,
        })
      );
      // Redirect ke halaman reservation
      navigate("/reservation");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg font-semibold text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg font-semibold text-red-500">{error}</p>
        <Link
          to="/"
          className="ml-4 text-orange-600 hover:underline font-semibold"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg font-semibold text-gray-600">
          Room data not found.
        </p>
        <Link
          to="/"
          className="ml-4 text-orange-600 hover:underline font-semibold"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-96 bg-cover bg-center"
        style={{
          backgroundImage: `url(${BASE_URL_STORAGE}/${room.image_url})`,
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute inset-0 flex items-center justify-center text-center text-white">
          <div>
            <h1 className="text-5xl font-bold">
              {room.room_type} / {room.room_name}
            </h1>
            <p className="text-xl mt-4">
              {formatCurrency(room.price_per_night)} / night
            </p>
          </div>
        </div>
      </section>

      {/* Room Details */}
      <section className="py-12 px-6 sm:px-12 max-w-7xl mx-auto">
        <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">
          Room Details
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <p className="text-lg text-gray-600 leading-relaxed">
              {room.description || "No description available for this room."}
            </p>
            <p className="text-lg font-semibold mt-4">
              Capacity: {room.capacity || "N/A"} people
            </p>
          </div>
          <div className="flex justify-center items-center">
            <button
              disabled={!(canBook && room.status !== "booked")}
              onClick={handleBookNow}
              className={`px-8 py-4 rounded-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                !(canBook && room.status !== "booked")
                  ? "bg-orange-300 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {canBook
                ? room.status === "booked"
                  ? "Room Booked"
                  : "Book Now"
                : "You have an active reservation. Complete it first."}
            </button>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-12 px-6 sm:px-12 bg-white max-w-7xl mx-auto">
        <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">
          Facilities
        </h2>
        {room.room_facilitys && room.room_facilitys.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {room.room_facilitys.map((facility) => (
              <div
                key={facility.id}
                className="bg-gray-100 p-6 rounded-lg shadow-md text-center"
              >
                <h3 className="text-lg font-semibold mb-2">
                  {facility.facility_name}
                </h3>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-lg text-gray-600 text-center">
            No facilities available for this room.
          </p>
        )}
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-12 px-6 sm:px-12 max-w-7xl mx-auto">
        <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">
          What Our Guests Say
        </h2>
        {room.reviews && room.reviews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {room.reviews.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white p-6 shadow-md rounded-lg"
              >
                <p className="italic text-gray-700">
                  "{testimonial.review_text}"
                </p>
                <p className="mt-4 font-semibold text-gray-800">
                  - {testimonial.User.name}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-lg text-gray-600 text-center">
            No testimonials available for this room.
          </p>
        )}
      </section>
    </div>
  );
};

export default DetailPage;
