// frontend/src/service/api.js
import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

export const getIssues = async () => {
    const response = await API.get('/issues');
    return response.data;
};

export const createIssue = async (issueData) => {
    const response = await API.post('/issues', issueData);
    return response.data;
};

export const upvoteIssue = async (id) => {
    const response = await API.put(`/issues/${id}/vote`);
    return response.data;
};

/**
 * Upload an image file to Cloudinary via the backend proxy endpoint.
 * Returns the secure Cloudinary URL string.
 *
 * @param {File} file - The image file from the file input or drag-and-drop
 * @returns {Promise<string>} - Cloudinary secure URL
 */
export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await API.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.url; // Cloudinary secure_url returned by backend
};