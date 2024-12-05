export const BASE_URL_STORAGE = import.meta.env.VITE_REACT_API_STORAGE_URL;

export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value)
  }