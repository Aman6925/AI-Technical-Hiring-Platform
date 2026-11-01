import api from "./api";

// Get all questions of an assessment
export const getQuestions = async (assessmentId) => {
  const response = await api.get(
    `/assessments/${assessmentId}/questions`
  );

  return response.data;
};

// Add a new question
export const addQuestion = async (assessmentId, questionData) => {
  const response = await api.post(
    `/assessments/${assessmentId}/questions`,
    questionData
  );

  return response.data;
};

// Update an existing question
export const updateQuestion = async (
  assessmentId,
  questionId,
  questionData
) => {
  const response = await api.put(
    `/assessments/${assessmentId}/questions/${questionId}`,
    questionData
  );

  return response.data;
};

// Delete a question
export const deleteQuestion = async (assessmentId, questionId) => {
  const response = await api.delete(
    `/assessments/${assessmentId}/questions/${questionId}`
  );

  return response.data;
};