import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerService } from "../services/apiService";
import { toast } from "react-toastify";

// Definisi Skema Validasi dengan Zod
const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match",
  });

// Tipe Data Form
type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false); // State untuk loading
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true); // Mulai loading
    try {
      await registerService(data); // Simulasi request ke API
      toast.success("Registration successful!");
      reset()
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false); // Selesai loading
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Create an Account
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-600"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              {...register("name")}
              className={`w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-600"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              {...register("email")}
              className={`w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-600"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register("password")}
              className={`w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="password_confirmation"
              className="block text-sm font-medium text-gray-600"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="password_confirmation"
              {...register("password_confirmation")}
              className={`w-full mt-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                errors.password_confirmation ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Confirm your password"
            />
            {errors.password_confirmation && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password_confirmation.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-orange-400 ${
              isLoading
                ? "bg-orange-300 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
            disabled={isLoading} // Disable tombol saat loading
          >
            {isLoading ? "Registering..." : "Create Account"}
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-orange-500 hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
