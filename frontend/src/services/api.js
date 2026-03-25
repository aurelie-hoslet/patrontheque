import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const patronService = {
  getAll: () => axios.get(`${API_URL}/patrons`),
  getById: (id) => axios.get(`${API_URL}/patrons/${id}`),
  create: (patron) => axios.post(`${API_URL}/patrons`, patron),
  update: (id, patron) => axios.put(`${API_URL}/patrons/${id}`, patron),
  delete: (id) => axios.delete(`${API_URL}/patrons/${id}`),
  search: (filters) => axios.post(`${API_URL}/patrons/search`, filters),
  getFilterOptions: () => axios.get(`${API_URL}/stats/filter-options`),
  setARevoir: (id, aRevoir) => axios.patch(`${API_URL}/patrons/${id}/aRevoir`, { aRevoir }),
  setComplet: (id, complet) => axios.patch(`${API_URL}/patrons/${id}/complet`, { complet }),
  setFavori: (id, favori) => axios.patch(`${API_URL}/patrons/${id}/favori`, { favori }),
  getPdfs: (id) => axios.get(`${API_URL}/patrons/${id}/pdfs`),
  deletePdf: (id, filename) => axios.delete(`${API_URL}/patrons/${id}/pdfs/${encodeURIComponent(filename)}`)
};

export const tissuService = {
  getAll: () => axios.get(`${API_URL}/tissus`),
  create: (tissu) => axios.post(`${API_URL}/tissus`, tissu),
  update: (id, tissu) => axios.put(`${API_URL}/tissus/${id}`, tissu),
  delete: (id) => axios.delete(`${API_URL}/tissus/${id}`)
};

export const projetService = {
  getAll: () => axios.get(`${API_URL}/projets`),
  create: (projet) => axios.post(`${API_URL}/projets`, projet),
  update: (id, projet) => axios.put(`${API_URL}/projets/${id}`, projet),
  delete: (id) => axios.delete(`${API_URL}/projets/${id}`),
  setEtape: (id, etapeIndex, faite) => axios.patch(`${API_URL}/projets/${id}/etape/${etapeIndex}`, { faite }),
  setEtapes: (id, etapes) => axios.patch(`${API_URL}/projets/${id}/etapes`, { etapes }),
  getEtapesSuggestions: () => axios.get(`${API_URL}/projets/etapes-suggestions`),
  setStatut: (id, statut) => axios.patch(`${API_URL}/projets/${id}/statut`, { statut }),
  setImagePosition: (id, imagePosition) => axios.patch(`${API_URL}/projets/${id}/imagePosition`, { imagePosition })
};

export const dealerService = {
  getAll: () => axios.get(`${API_URL}/dealers`),
  create: (dealer) => axios.post(`${API_URL}/dealers`, dealer),
  update: (id, dealer) => axios.put(`${API_URL}/dealers/${id}`, dealer),
  delete: (id) => axios.delete(`${API_URL}/dealers/${id}`)
};

export const inspirationService = {
  getAll: () => axios.get(`${API_URL}/inspirations`),
  create: (item) => axios.post(`${API_URL}/inspirations`, item),
  update: (id, item) => axios.put(`${API_URL}/inspirations/${id}`, item),
  delete: (id) => axios.delete(`${API_URL}/inspirations/${id}`),
  setImagePosition: (id, imagePosition) => axios.patch(`${API_URL}/inspirations/${id}/imagePosition`, { imagePosition })
};

export const wishlistService = {
  getAll: () => axios.get(`${API_URL}/wishlist`),
  create: (item) => axios.post(`${API_URL}/wishlist`, item),
  update: (id, item) => axios.put(`${API_URL}/wishlist/${id}`, item),
  delete: (id) => axios.delete(`${API_URL}/wishlist/${id}`)
};

export const ogService = {
  preview: (url) => axios.get(`${API_URL}/og-preview`, { params: { url } }),
};

export const mensurationsService = {
  getAll: () => axios.get(`${API_URL}/mensurations`),
  create: (item) => axios.post(`${API_URL}/mensurations`, item),
  update: (id, item) => axios.put(`${API_URL}/mensurations/${id}`, item),
  delete: (id) => axios.delete(`${API_URL}/mensurations/${id}`)
};