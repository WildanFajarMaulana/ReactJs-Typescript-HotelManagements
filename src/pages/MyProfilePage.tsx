import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  cancelReservationService,
  createRatingService,
  fetchHistoryReservationsService,
} from "../services/apiService";
import { Reservation, User } from "../types/type";
import { toast } from "react-toastify";
import { BASE_URL_STORAGE, formatCurrency } from "../utils/utils";

const MyProfilePage = () => {
  const { user } = useAuth();
  const dataUser = user?.data?.user as User;

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [rating, setRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState<string>(""); // Tambahkan state untuk review_text
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(false);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        const response = await fetchHistoryReservationsService();
        console.log(response.data.reservations);
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
    setReviewText(""); // Reset review_text saat detail dipilih
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReservation(null);
    setRating(null);
    setReviewText("");
  };

  const handleCancelReservation = async (reservationId: number) => {
    setLoadingAction("cancel");
    try {
      await cancelReservationService(reservationId);
      toast.success("Reservation canceled successfully!");
      setTriggerRefresh(true);
    } catch (error) {
      console.error("Error canceling reservation:", error);
      toast.error("Failed to cancel reservation.");
    } finally {
      setLoadingAction(null);
      handleCloseModal();
    }
  };

  const handleSubmitRating = async (reservationId: number) => {
    if (rating === null || reviewText.trim() === "") {
      toast.warning("Please provide both a rating and a review.");
      return;
    }

    setLoadingAction("rating");
    try {
      await createRatingService(reservationId, {
        rating,
        review_text: reviewText,
      }); // Kirim rating dan review_text
      toast.success("Thank you for your feedback!");
      setTriggerRefresh(true);
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Failed to submit feedback.");
    } finally {
      setLoadingAction(null);
      handleCloseModal();
    }
  };

  // Helper: Cek apakah user sudah memberi rating untuk room ini
  const hasUserRatedReservation = (reservation: Reservation): boolean => {
    return reservation.room?.reviews?.some(
      (review) =>
        review.user_id === dataUser?.id &&
        review.reservation_id === reservation.id // Cek berdasarkan reservation_id
    );
  };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-3xl w-full my-28">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-gray-800">My Profile</h1>
          <p className="text-gray-600">Manage your personal information</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-6">
          <div className="flex-shrink-0">
            <img
              src="https://bk.unipasby.ac.id/morevej/2023/09/user-1.png"
              alt="Profile Avatar"
              className="w-32 h-32 rounded-full border-4 border-orange-500 object-cover"
            />
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800">
              {dataUser?.name || "John Doe"}
            </h2>
            <p className="text-gray-600">
              {dataUser?.email || "user@example.com"}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Your Reservations
          </h2>

          {loading ? (
            <div className="flex justify-center items-center">
              <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-orange-600 rounded-full"></div>
            </div>
          ) : reservations.length > 0 ? (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex justify-between items-center border-b py-3"
                >
                  <div>
                    <p className="text-lg text-gray-800 font-medium">
                      {reservation.reservation_code}
                    </p>
                    <Link to={`/room/${reservation?.room?.room_slug}`}>
                      <p className="text-lg text-gray-800 font-medium">
                        Room : {reservation.room?.room_name || "Unknown Room"}
                      </p>
                    </Link>
                    <p className="text-lg text-gray-800 font-medium">
                      {reservation.reservation_status}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(reservation.check_in_date).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(
                        reservation.check_out_date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-x-4">
                    {reservation.reservation_status === "pending" && (
                      <button
                        onClick={() => handleCancelReservation(reservation.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={() => handleDetailClick(reservation)}
                      className="text-orange-600 hover:text-orange-800"
                    >
                      Detail
                    </button>
                  </div>
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
          <div className="bg-white p-8 rounded-lg max-w-lg w-full shadow-lg my-28 overflow-y-auto max-h-[90vh]">
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
                <strong>Total Price:</strong> {formatCurrency(selectedReservation.total_price)}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Status:</strong>{" "}
                {selectedReservation.reservation_status}
              </p>

              {/* Proof Section */}
              {selectedReservation.payment.proof && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Payment Proof
                  </h3>
                  <div className="flex items-center justify-start gap-4">
                    <img
                      src={`${BASE_URL_STORAGE}/${selectedReservation.payment.proof}`}
                      alt="Proof of Payment"
                      className="w-96 h-96 object-cover rounded-lg shadow"
                    />
                  </div>
                </div>
              )}
            </div>

            {selectedReservation.reservation_status === "completed" &&
              !hasUserRatedReservation(selectedReservation) && (
                <div className="mt-6">
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
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Write your review here..."
                    className="w-full border border-gray-300 rounded-lg p-3 mb-4"
                  />
                  <button
                    onClick={() => handleSubmitRating(selectedReservation.id)}
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50"
                    disabled={loadingAction === "rating"}
                  >
                    {loadingAction === "rating" ? (
                      <div className="spinner-border animate-spin inline-block w-4 h-4 border-2 border-solid border-white rounded-full"></div>
                    ) : (
                      "Submit Feedback"
                    )}
                  </button>
                </div>
              )}

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
