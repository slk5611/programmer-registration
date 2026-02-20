const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiService = {
    // Check for duplicate email, mobile, or empId
    checkDuplicate: async (params) => {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/programmers/check-duplicate?${query}`);
        if (!response.ok) throw new Error('Failed to check duplicate');
        return await response.json();
    },

    // Register a new programmer
    registerProgrammer: async (data) => {
        const response = await fetch(`${API_BASE_URL}/programmers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Failed to register programmer');
        }
        return await response.json();
    },

    // Get all programmers with optional filters
    getProgrammers: async (filters = {}) => {
        const query = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_BASE_URL}/programmers?${query}`);
        if (!response.ok) throw new Error('Failed to fetch programmers');
        return await response.json();
    },

    // Delete a single programmer
    deleteProgrammer: async (id) => {
        const response = await fetch(`${API_BASE_URL}/programmers/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete programmer');
        return await response.json();
    },

    // Bulk delete programmers
    bulkDelete: async (ids) => {
        const response = await fetch(`${API_BASE_URL}/programmers/bulk-delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids })
        });
        if (!response.ok) throw new Error('Failed to bulk delete');
        return await response.json();
    },

    // Auth Login
    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Login failed');
        }
        return await response.json();
    }
};
