import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginService } from "../services/apiService";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Schema untuk validasi login
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Tipe untuk form login
type LoginForm = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); // State untuk loading
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true); // Mulai loading
    try {
      const response = await loginService(data); // Simulasi request ke API
      toast.success("Login successful!");
      login(response); 
      reset();
      navigate('/');
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false); // Selesai loading
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-semibold text-gray-800">Login</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Email Address</label>
            <input
              type="email"
              {...register("email")}
              className={`mt-2 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.email ? "border-red-500" : ""}`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              {...register("password")}
              className={`mt-2 w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.password ? "border-red-500" : ""}`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full p-3 rounded-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-orange-500 ${isLoading ? "bg-orange-300 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"}`}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Login"}
          </button>
        </form>

        {/* Register Link */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a href="/register" className="text-orange-500 hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
