import React, { createContext, useContext, useState, ReactNode } from "react";

// Tipe data untuk AuthContext
type AuthContextType = {
  user: any;
  login: (userData: any) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Menyediakan context ke seluruh aplikasi
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);

  // Fungsi login untuk menyimpan data user ke state dan localStorage
  const login = (userData: any) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // Simpan ke localStorage
  };

  // Fungsi logout untuk menghapus data user dari state dan localStorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook untuk menggunakan context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
