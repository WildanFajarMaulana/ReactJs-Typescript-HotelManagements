import apiClient from "./apiConfigurationService";

export const fetchRoomsService = async () => {
  const response = await apiClient.get("/rooms");
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