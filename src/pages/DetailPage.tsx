import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  fetchHistoryReservationsService,
  fetchRoomBySlugService,
} from "../services/apiService";
import { BASE_URL_STORAGE, formatCurrency } from "../utils/utils";
import { Reservation, Room } from "../types/type";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const DetailPage = () => {
  const { user } = useAuth();
  const { slug } = useParams<{ slug: string }>(); // Mendapatkan slug dari URL
  const [room, setRoom] = useState<Room | null>(null); // Menambahkan tipe Room
  const [loading, setLoading] = useState(true); // State untuk loading
  const [error, setError] = useState<string>(""); // State untuk error handling
  const navigate = useNavigate(); // Untuk redirect halaman

  const [reservations, setReservations] = useState<Reservation[]>([]); // Menambahkan tipe untuk reservasi
  const [canBook, setCanBook] = useState(true); // Default bisa pesan

  const roomProcess: any = localStorage.getItem("reservation")
    ? JSON.parse(localStorage.getItem("reservation") as string)
    : null;

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
      (reservation) =>
        reservation.reservation_status !== "completed" &&
        reservation.reservation_status !== "canceled"
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
        console.log(response.data);
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
  const handleBookNow = (room: Room) => {
    if (roomProcess && roomProcess.room_id === room.id && roomProcess.room_slug === room.room_slug) {
      toast.warning(
        "You already have a pending reservation for this room. Please complete it first!"
      );
      return;
    }

    if (room) {
      // Simpan data kamar ke localStorage
      localStorage.setItem(
        "reservation",
        JSON.stringify({
          room_id: room.id,
          room_slug: room.room_slug
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
              onClick={() => handleBookNow(room)}
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
        <h2 className="text-4xl font-bold mb-8 text-center text-gray-800">
          What Our Guests Say
        </h2>
        {room.reviews && room.reviews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {room.reviews.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white p-6 shadow-md rounded-lg transition-transform hover:scale-105"
              >
                {/* Rating Section */}
                <div className="flex items-center mb-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <svg
                      key={index}
                      className={`w-5 h-5 ${
                        index < testimonial.rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.09c.969 0 1.371 1.24.588 1.81l-3.316 2.41a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118L10 13.348l-3.316 2.41c-.784.57-1.838-.197-1.539-1.118l1.286-3.97a1 1 0 00-.364-1.118l-3.316-2.41c-.784-.57-.38-1.81.588-1.81h4.09a1 1 0 00.95-.69l1.286-3.97z" />
                    </svg>
                  ))}
                </div>

                {/* Review Text */}
                <p className="italic text-gray-700">
                  "{testimonial?.review_text}"
                </p>

                {/* User Information */}
                <p className="mt-4 font-semibold text-gray-800">
                  - {testimonial?.user.name}
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
