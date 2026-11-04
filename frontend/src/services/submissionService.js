import api from "./api";

// Start Assessment
export const startAssessment = async (assessmentId) => {
    const response = await api.post(
        `/submissions/${assessmentId}/start`
    );

    return response.data;
};

// Submit Assessment
export const submitAssessment = async (submissionId, answers) => {
    const response = await api.post(
        `/submissions/${submissionId}/submit`,
        { answers }
    );

    return response.data;
};