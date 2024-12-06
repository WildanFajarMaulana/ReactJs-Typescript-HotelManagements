import axios from "axios";

const BASE_URL = import.meta.env.VITE_REACT_API_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem("user"); // Ambil data dari localStorage
    if (userString) {
      try {
        const user: any = JSON.parse(userString); // Gunakan any untuk tipe data user
        if (user?.data?.token) {
          config.headers.Authorization = `Bearer ${user.data.token}`; // Tambahkan header Authorization
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const isAxiosError = axios.isAxiosError;

export default apiClient;
