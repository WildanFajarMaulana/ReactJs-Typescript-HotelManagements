import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { fetchHistoryReservationsService } from "../services/apiService";
import { Link } from "react-router-dom";

interface Reservation {
  id: number;
  reservation_code: string;
  check_in_date: string;
  check_out_date: string;
  total_price: number;
  reservation_status: string;
  room?: {
    room_name: string;
    room_slug: string;
  };
}

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: string;
}

const MyProfilePage = () => {
  const { user } = useAuth();
  const dataUser = user?.data?.user as User;
  
  const [reservations, setReservations] = useState<Reservation[]>([]); // Menyimpan data reservasi
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null); // Menyimpan detail reservasi yang dipilih
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Menyimpan status modal (terbuka atau tertutup)
  const [loading, setLoading] = useState<boolean>(false); // Menyimpan status loading

  // Mengambil data reservasi pengguna dari API
  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true); // Menyatakan bahwa data sedang dimuat
      try {
        const response = await fetchHistoryReservationsService(); // Sesuaikan dengan endpoint API Anda
        console.log(response.data);
        setReservations(response.data.reservations);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      } finally {
        setLoading(false); // Set loading menjadi false setelah data berhasil atau gagal diambil
      }
    };

    if (dataUser?.id) {
      fetchReservations();
    }
  }, [dataUser?.id]);

  // Menampilkan modal detail reservasi
  const handleDetailClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true); // Buka modal
  };

  // Menutup modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReservation(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-gray-800">My Profile</h1>
          <p className="text-gray-600">Manage your personal information</p>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img
              src={dataUser?.avatar || "https://bk.unipasby.ac.id/morevej/2023/09/user-1.png"}
              alt="Profile Avatar"
              className="w-32 h-32 rounded-full border-4 border-orange-500 object-cover"
            />
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {dataUser?.name || "John Doe"}
              </h2>
              <p className="text-gray-600">{dataUser?.email || "user@example.com"}</p>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-lg text-gray-800">{dataUser?.phone || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p className="text-lg text-gray-800">{dataUser?.role || "Not provided"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reservations Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Reservations</h2>

          {/* Loading Spinner */}
          {loading ? (
            <div className="flex justify-center items-center">
              <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-solid border-orange-600 rounded-full" role="status">
                <span className="visually-hidden"></span>
              </div>
            </div>
          ) : reservations.length > 0 ? (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="flex justify-between items-center border-b py-3">
                  <div>
                    <Link to={`/room/${reservation?.room?.room_slug}`}>
                      <p className="text-lg text-gray-800 font-medium">
                        {reservation.room?.room_name || "Unknown Room"}
                      </p>
                    </Link>
                    <p className="text-sm text-gray-600">
                      {new Date(reservation.check_in_date).toLocaleDateString()} - {new Date(reservation.check_out_date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDetailClick(reservation)}
                    className="text-orange-600 hover:text-orange-800"
                  >
                    Detail
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">You have no reservations.</p>
          )}
        </div>
      </div>

      {/* Modal for Reservation Detail */}
      {isModalOpen && selectedReservation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h2 className="text-2xl font-semibold text-gray-800">Reservation Detail</h2>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Reservation Code: {selectedReservation.reservation_code}
              </p>
              <p className="text-sm text-gray-600">
                Room: {selectedReservation.room?.room_name}
              </p>
              <p className="text-sm text-gray-600">
                Check-in: {new Date(selectedReservation.check_in_date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                Check-out: {new Date(selectedReservation.check_out_date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                Total Price: ${selectedReservation.total_price}
              </p>
              <p className="text-sm text-gray-600">
                Status: {selectedReservation.reservation_status}
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfilePage;
