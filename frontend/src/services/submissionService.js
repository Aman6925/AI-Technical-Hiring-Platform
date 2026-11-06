import api from "./api";

// Start Assessment
export const startAssessment = async (assessmentId) => {
    const response = await api.post(
        `/submissions/${assessmentId}/start`
    );

    return response.data;
};

// Get Assessment Attempt Details
export const getAssessmentAttempt = async (submissionId) => {
    const response = await api.get(
        `/submissions/${submissionId}/attempt`
    );

    return response.data;
};

// Save Candidate Answer
export const saveAnswer = async (
    submissionId,
    questionId,
    selectedAnswer
) => {
    const response = await api.patch(
        `/submissions/${submissionId}/answer`,
        {
            questionId,
            selectedAnswer
        }
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

// Get Assessment Results (Recruiter)
export const getAssessmentResults = async (assessmentId) => {
    const response = await api.get(
        `/submissions/${assessmentId}/results`
    );

    return response.data;
};