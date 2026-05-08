import api from "@/apiConfig";

export const getInstagramComments = async (mediaId: string) => {
    const response = await api.get(`/api/instagram/media/${mediaId}/comments`);
    return response.data;
};

export const addInstagramComment = async (mediaId: string, text: string) => {
    const response = await api.post(`/api/instagram/media/${mediaId}/comments`, { text });
    return response.data;
};

export const editInstagramComment = async (commentId: string, text: string) => {
    const response = await api.put(`/api/instagram/comments/${commentId}`, { text });
    return response.data;
};

export const deleteInstagramComment = async (commentId: string) => {
    const response = await api.delete(`/api/instagram/comments/${commentId}`);
    return response.data;
};
