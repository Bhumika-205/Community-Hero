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

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await API.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data.url;
};

export const analyzeImage = async (imageUrl) => {
    const response = await API.post('/ai/analyze', {
        imageUrl,
        title: '',
        description: '',
    });

    return response.data;
};