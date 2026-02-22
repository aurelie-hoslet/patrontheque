import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const patronService = {
  getAll: () => axios.get(`${API_URL}/patrons`),
  getById: (id) => axios.get(`${API_URL}/patrons/${id}`),
  create: (patron) => axios.post(`${API_URL}/patrons`, patron),
  update: (id, patron) => axios.put(`${API_URL}/patrons/${id}`, patron),
  delete: (id) => axios.delete(`${API_URL}/patrons/${id}`),
  search: (filters) => axios.post(`${API_URL}/patrons/search`, filters),
  getFilterOptions: () => axios.get(`${API_URL}/stats/filter-options`)
};