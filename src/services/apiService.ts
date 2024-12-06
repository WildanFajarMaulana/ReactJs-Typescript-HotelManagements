import apiClient from "./apiConfigurationService";

export const fetchRoomsService = async () => {
  const response = await apiClient.get("/rooms");
  return response;
};

export const fetchRoomBySlugService = async (slug : any) => {
  const response = await apiClient.get(`/rooms/${slug}`);
  return response;
};

export const fetchHistoryReservationsService = async () => {
  const response = await apiClient.get(`/history-reservation`);
  return response;
};


export const registerService = async (body: any) => {
  const response = await apiClient.post(`/register`, body);
  return response;
};

export const loginService = async (body: any) => {
  const response = await apiClient.post(`/login`, body);
  return response;
};


export const cancelReservationService = async (reservation_id: number) => {
  const response = await apiClient.post(`/cancel-reservation/${reservation_id}`);
  return response;
};