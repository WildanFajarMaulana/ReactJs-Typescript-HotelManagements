import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Room } from "../types/type";
import { BASE_URL_STORAGE, formatCurrency } from "../utils/utils";
import {
  createReservationService,
  fetchRoomBySlugService,
} from "../services/apiService";

// Schema validation using Zod
const reservationSchema = z
  .object({
    checkInDate: z
      .string()
      .nonempty("Check-in date is required")
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
      })
      .refine(
        (val) => {
          const selectedDate = new Date(val);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return selectedDate >= today;
        },
        { message: "Check-in date cannot be in the past" }
      ),

    checkOutDate: z
      .string()
      .nonempty("Check-out date is required")
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
      }),

    paymentMethod: z.enum(["manual", "midtrans"]),
    paymentStatus: z.boolean().optional(),
    proof: z
      .instanceof(FileList)
      .optional()
      .refine(
        (files) =>
          !files || // Optional, jadi bisa kosong
          Array.from(files).every((file) =>
            ["image/jpeg", "image/png", "image/jpg"].includes(file.type)
          ),
        {
          message: "Only image files (JPG, PNG) are allowed.",
        }
      ),
  })
  .refine((data) => new Date(data.checkInDate) < new Date(data.checkOutDate), {
    message: "Check-out date must be after check-in date",
    path: ["checkOutDate"], // Menunjukkan field error
  });

type ReservationFormValues = z.infer<typeof reservationSchema>;

const ReservationPage: React.FC = () => {
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
  });

  console.log(errors);
  // Fetch room data from localStorage on page load
  useEffect(() => {
    const storedReservation = localStorage.getItem("reservation");
    if (storedReservation) {
      const parsedReservation = JSON.parse(storedReservation);
      fetchRoomData(parsedReservation.room_slug);
    } else {
      if (!toast.isActive("no-room-toast")) {
        toast.error("No room selected!", { toastId: "no-room-toast" });
      }
      navigate("/");
    }
  }, []);

  // Fetch room details from the API
  const fetchRoomData = async (roomSlug: string) => {
    setIsLoading(true);
    try {
      const response = await fetchRoomBySlugService(roomSlug);
      setRoom(response.data.data);
    } catch (error) {
      console.error("Error fetching room:", error);
      toast.error("Failed to fetch room data.");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total price based on check-in and check-out dates
  const calculateTotalPrice = (
    checkInDate: string | undefined,
    checkOutDate: string | undefined
  ) => {
    if (checkInDate && checkOutDate && room) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const stayDuration = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );
      setTotalPrice(stayDuration * room.price_per_night);
    }
  };

  useEffect(() => {
    const checkInDate = watch("checkInDate");
    const checkOutDate = watch("checkOutDate");
    calculateTotalPrice(checkInDate, checkOutDate);
  }, [watch("checkInDate"), watch("checkOutDate"), room]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setValue("proof", files); // Set FileList ke form state
    }
  };

  // Submit handler for reservation form
  const onSubmit = async (data: ReservationFormValues) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("room_id", room?.id.toString() || "");
      formData.append("check_in_date", data.checkInDate);
      formData.append("check_out_date", data.checkOutDate);
      formData.append("payment_method", data.paymentMethod);
      formData.append("payment_status", data.paymentStatus ? "1" : "0");

      if (data.proof && data.proof[0]) {
        formData.append("proof", data.proof[0]);
      }

      await createReservationService(formData);
      toast.success("Reservation created successfully!");
      localStorage.removeItem("reservation");
      navigate("/my-profile");
    } catch (error) {
      console.error("Error creating reservation:", error);
      toast.error("Failed to create reservation.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to delete reservation data from localStorage
  const handleDeleteReservation = () => {
    localStorage.removeItem("reservation");
    toast.success("Reservation data has been deleted!");
    navigate("/");
  };

  if (!room && !isLoading) {
    return <p>Room not found or failed to load.</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 py-12 px-4">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-8 my-28">
        {room ? (
          <>
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">
              Book Room: {room.room_name}
            </h1>
            <div className="mb-6">
              <img
                src={
                  room.image_url
                    ? `${BASE_URL_STORAGE}/${room.image_url}`
                    : "https://via.placeholder.com/600"
                }
                alt={room.room_name}
                className="w-full h-64 object-cover rounded-lg shadow-md"
              />
            </div>
            <p className="text-lg text-gray-600 mb-4">
              Price per night:{" "}
              <span className="text-indigo-600 font-bold">
                {formatCurrency(room.price_per_night)}
              </span>
            </p>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label
                    htmlFor="checkInDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Check-In Date
                  </label>
                  <input
                    type="date"
                    id="checkInDate"
                    {...register("checkInDate")}
                    className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      errors.checkInDate ? "border-red-500" : ""
                    }`}
                  />
                  {errors.checkInDate && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.checkInDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="checkOutDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Check-Out Date
                  </label>
                  <input
                    type="date"
                    id="checkOutDate"
                    {...register("checkOutDate")}
                    className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      errors.checkOutDate ? "border-red-500" : ""
                    }`}
                  />
                  {errors.checkOutDate && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.checkOutDate.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="mb-6">
                <label
                  htmlFor="paymentMethod"
                  className="block text-sm font-medium text-gray-700"
                >
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  {...register("paymentMethod")}
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="manual">Manual</option>
                  <option value="midtrans" disabled>
                    Midtrans (Coming soon)
                  </option>
                </select>
                {errors.paymentMethod && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.paymentMethod.message}
                  </p>
                )}
              </div>
              <div className="mb-6">
                <label
                  htmlFor="proof"
                  className="block text-sm font-medium text-gray-700"
                >
                  Upload Payment Proof (optional) // NO REKENING 2321321232 (HOTEL DER)
                </label>
                <input
                  type="file"
                  id="proof"
                  onChange={handleFileChange}
                  className="mt-2 block w-full text-sm border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.proof && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.proof.message}
                  </p>
                )}
              </div>
              <div className="mb-6">
                <p className="text-lg text-gray-600">
                  Total Price:{" "}
                  <span className="text-indigo-600 font-bold">
                    {formatCurrency(totalPrice)}
                  </span>
                </p>
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleDeleteReservation}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Submit Reservation"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <p>Loading room details...</p>
        )}
      </div>
    </div>
  );
};

export default ReservationPage;
