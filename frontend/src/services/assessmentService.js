
import api from "./api";

// Get all assessments
export const getAssessments = async () => {
  const response = await api.get("/assessments");
  return response.data;
};

// Get assessment by ID
export const getAssessmentById = async (assessmentId) => {
  const response = await api.get(`/assessments/${assessmentId}`);
  return response.data;
};

// Create a new assessment
export const createAssessment = async (assessmentData) => {
  const response = await api.post("/assessments", assessmentData);
  return response.data;
};

// Update assessment
export const updateAssessment = async (assessmentId, assessmentData) => {
  const response = await api.put(
    `/assessments/${assessmentId}`,
    assessmentData
  );
  return response.data;
};

// Delete assessment
export const deleteAssessment = async (assessmentId) => {
  const response = await api.delete(`/assessments/${assessmentId}`);
  return response.data;
};
