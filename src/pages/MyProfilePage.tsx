import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import {
  cancelReservationService,
  fetchHistoryReservationsService,
} from "../services/apiService"; // Tambahkan service baru untuk cancel dan rating
import { Link } from "react-router-dom";
import { Reservation, User } from "../types/type";
import { toast } from "react-toastify";

const MyProfilePage = () => {
  const { user } = useAuth();
  const dataUser = user?.data?.user as User;

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [rating, setRating] = useState<number | null>(null); // Untuk rating
  const [loadingAction, setLoadingAction] = useState<string | null>(null); // Loading state untuk tombol tindakan
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(false);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        const response = await fetchHistoryReservationsService();
        setReservations(response.data.reservations);
      } catch (error) {
        console.error("Error fetching reservations:", error);
        setTriggerRefresh(false);
      } finally {
        setLoading(false);
        setTriggerRefresh(false);
      }
    };

    if (dataUser?.id || triggerRefresh) {
      fetchReservations();
    }
  }, [dataUser?.id, triggerRefresh]);

  const handleDetailClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setRating(null); // Reset rating saat detail dipilih
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReservation(null);
  };

  // Fungsi untuk cancel reservation
  const handleCancelReservation = async (reservationId: number) => {
    setLoadingAction("cancel");
    try {
      // Simulasi permintaan cancel reservation
      await cancelReservationService(reservationId);
      toast.success("Reservation canceled successfully!");
      setTriggerRefresh(true)
    } catch (error) {
      console.error("Error canceling reservation:", error);
      toast.error("Failed to cancel reservation.");
    } finally {
      setLoadingAction(null); // Reset loading setelah aksi selesai
      handleCloseModal();
    }
  };

  // Fungsi untuk memberikan rating
  const handleSubmitRating = async (reservationId: number) => {
    if (rating === null) {
      toast.warning("Please select a rating.");
      return;
    }

    setLoadingAction("rating");
    try {
      // await submitRatingService(reservationId, rating); // Service untuk rating
      toast.success("Thank you for your rating!");
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Failed to submit rating.");
    } finally {
      setLoadingAction(null); // Reset loading setelah aksi selesai
      handleCloseModal(); // Menutup modal setelah submit
    }
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
          <div className="flex-shrink-0">
            <img
              src={"https://bk.unipasby.ac.id/morevej/2023/09/user-1.png"}
              alt="Profile Avatar"
              className="w-32 h-32 rounded-full border-4 border-orange-500 object-cover"
            />
          </div>

          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {dataUser?.name || "John Doe"}
              </h2>
              <p className="text-gray-600">
                {dataUser?.email || "user@example.com"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-lg text-gray-800">
                  {dataUser?.phone || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p className="text-lg text-gray-800">
                  {dataUser?.role || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reservations Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Your Reservations
          </h2>

          {loading ? (
            <div className="flex justify-center items-center">
              <div
                className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-solid border-orange-600 rounded-full"
                role="status"
              >
                <span className="visually-hidden"></span>
              </div>
            </div>
          ) : reservations.length > 0 ? (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex justify-between items-center border-b py-3"
                >
                  <div>
                    <Link to={`/room/${reservation?.room?.room_slug}`}>
                      <p className="text-lg text-gray-800 font-medium">
                        {reservation.room?.room_name || "Unknown Room"}
                      </p>
                    </Link>
                    <p className="text-sm text-gray-600">
                      {new Date(reservation.check_in_date).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(
                        reservation.check_out_date
                      ).toLocaleDateString()}
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

      {isModalOpen && selectedReservation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-lg w-full shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Reservation Detail
            </h2>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                <strong>Reservation Code:</strong>{" "}
                {selectedReservation.reservation_code}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Room:</strong> {selectedReservation.room?.room_name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Check-in:</strong>{" "}
                {new Date(
                  selectedReservation.check_in_date
                ).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Check-out:</strong>{" "}
                {new Date(
                  selectedReservation.check_out_date
                ).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Total Price:</strong> ${selectedReservation.total_price}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Status:</strong>{" "}
                {selectedReservation.reservation_status}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-x-4 flex justify-end">
              {selectedReservation.reservation_status === "pending" && (
                <button
                  onClick={() =>
                    handleCancelReservation(selectedReservation.id)
                  }
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
                  disabled={loadingAction === "cancel"}
                >
                  {loadingAction === "cancel" ? (
                    <div className="spinner-border animate-spin inline-block w-4 h-4 border-2 border-solid border-white rounded-full"></div>
                  ) : (
                    "Cancel Reservation"
                  )}
                </button>
              )}

              {selectedReservation.reservation_status === "complete" && (
                <div className="flex flex-col items-start">
                  <p className="text-sm text-gray-600 mb-2">Give a rating:</p>
                  <div className="flex space-x-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={`px-4 py-2 ${
                          rating === star ? "bg-yellow-400" : "bg-gray-200"
                        } rounded-full transition-all`}
                        onClick={() => setRating(star)}
                      >
                        {star}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleSubmitRating(selectedReservation.id)}
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50"
                    disabled={loadingAction === "rating"}
                  >
                    {loadingAction === "rating" ? (
                      <div className="spinner-border animate-spin inline-block w-4 h-4 border-2 border-solid border-white rounded-full"></div>
                    ) : (
                      "Submit Rating"
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all"
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
