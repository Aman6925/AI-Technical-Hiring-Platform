import api from "./api";

// Get logged-in candidate's performance analytics
export const getMyPerformance = async () => {
  const response = await api.get("/submissions/my-results");
  return response.data;
};