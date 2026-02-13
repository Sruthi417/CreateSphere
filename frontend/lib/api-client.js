import axiosInstance from './axios';

// Auth API
export const authAPI = {
  register: (data) => axiosInstance.post('/auth/register', data),
  login: (data) => axiosInstance.post('/auth/login', data),
  verifyEmail: (token) => axiosInstance.get(`/auth/verify-email?token=${token}`),
  resendVerification: (email) => axiosInstance.post('/auth/resend-verification', { email }),
  forgotPassword: (email) => axiosInstance.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => axiosInstance.post(`/auth/reset-password?token=${token}`, { newPassword }),
  logout: () => axiosInstance.post('/auth/logout'),
};

// User API
export const userAPI = {
  getProfile: () => axiosInstance.get('/users/me/profile'),
  updateProfile: (data) => axiosInstance.put('/users/me/profile', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return axiosInstance.patch('/users/me/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  followCreator: (creatorId) => axiosInstance.post(`/users/follow/${creatorId}`),
  unfollowCreator: (creatorId) => axiosInstance.post(`/users/unfollow/${creatorId}`),
  getFollowing: (page = 1, limit = 12) => axiosInstance.get(`/users/me/following?page=${page}&limit=${limit}`),
  addFavorite: (productId) => axiosInstance.post(`/users/favorites/${productId}`),
  removeFavorite: (productId) => axiosInstance.delete(`/users/favorites/${productId}`),
  getFavorites: (page = 1, limit = 12) => axiosInstance.get(`/users/me/favorites?page=${page}&limit=${limit}`),
};

// Creator API
export const creatorAPI = {
  list: (page = 1, limit = 12) => axiosInstance.get(`/creators?page=${page}&limit=${limit}`),
  search: (query, limit = 20) => axiosInstance.get(`/creators/search?q=${query}&limit=${limit}`),
  getByCategory: (categoryId, page = 1, limit = 12) => axiosInstance.get(`/creators/category/${categoryId}?page=${page}&limit=${limit}`),
  getById: (creatorId) => axiosInstance.get(`/creators/${creatorId}`),
  startOnboarding: () => axiosInstance.post('/creators/start'),
  completeSetup: (data) => axiosInstance.post('/creators/complete', data),
  getMyProfile: () => axiosInstance.get('/creators/me/profile'),
  updateProfile: (data) => axiosInstance.put('/creators/me/profile', data),
  deactivate: () => axiosInstance.post('/creators/me/deactivate'),
  reactivate: () => axiosInstance.post('/creators/me/reactivate'),
};

// Product API
export const productAPI = {
  list: (page = 1, limit = 12, sort = 'newest') => axiosInstance.get(`/products?page=${page}&limit=${limit}&sort=${sort}`),
  search: (query, limit = 20) => axiosInstance.get(`/products/search?q=${query}&limit=${limit}`),
  getByCategory: (categoryId, page = 1, limit = 12) => axiosInstance.get(`/products/category/${categoryId}?page=${page}&limit=${limit}`),
  getByCreator: (creatorId) => axiosInstance.get(`/products/creator/${creatorId}`),
  getById: (productId) => axiosInstance.get(`/products/${productId}`),
  create: (data) => axiosInstance.post('/products', data),
  update: (productId, data) => axiosInstance.put(`/products/${productId}`, data),
  delete: (productId) => axiosInstance.delete(`/products/${productId}`),
  restore: (productId) => axiosInstance.post(`/products/${productId}/restore`),
  getMyList: () => axiosInstance.get('/products/me/list'),
  uploadImage: (formData) => axiosInstance.post('/products/image/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Tutorial API
export const tutorialAPI = {
  list: (page = 1, limit = 12, sort = 'newest') => axiosInstance.get(`/tutorials?page=${page}&limit=${limit}&sort=${sort}`),
  search: (query, limit = 20) => axiosInstance.get(`/tutorials/search?q=${query}&limit=${limit}`),
  getByCategory: (categoryId, page = 1, limit = 12) => axiosInstance.get(`/tutorials/category/${categoryId}?page=${page}&limit=${limit}`),
  getByCreator: (creatorId) => axiosInstance.get(`/tutorials/creator/${creatorId}`),
  getById: (tutorialId) => axiosInstance.get(`/tutorials/${tutorialId}`),
  create: (data) => axiosInstance.post('/tutorials', data),
  update: (tutorialId, data) => axiosInstance.put(`/tutorials/${tutorialId}`, data),
  delete: (tutorialId) => axiosInstance.delete(`/tutorials/${tutorialId}`),
  restore: (tutorialId) => axiosInstance.post(`/tutorials/${tutorialId}/restore`),
  getMyList: () => axiosInstance.get('/tutorials/me/list'),
};

// Category API
export const categoryAPI = {
  list: () => axiosInstance.get('/categories'),
  getBySlug: (slug) => axiosInstance.get(`/categories/${slug}`),
  create: (data) => axiosInstance.post('/categories', data),
  update: (id, data) => axiosInstance.put(`/categories/${id}`, data),
  deactivate: (id) => axiosInstance.post(`/categories/${id}/deactivate`),
  reactivate: (id) => axiosInstance.post(`/categories/${id}/reactivate`),
};

// Review API
export const reviewAPI = {
  getForTarget: (targetType, targetId) => axiosInstance.get(`/reviews/${targetType}/${targetId}`),
  create: (data) => axiosInstance.post('/reviews', data),
  update: (reviewId, data) => axiosInstance.put(`/reviews/${reviewId}`, data),
  delete: (reviewId) => axiosInstance.delete(`/reviews/${reviewId}`),
};

// Report API
export const reportAPI = {
  submit: (data) => axiosInstance.post('/reports', data),
  getForTarget: (targetType, targetId) => axiosInstance.get(`/reports/${targetType}/${targetId}`),
};

// Chat API
export const chatAPI = {
  getConversations: () => axiosInstance.get('/chat/conversations'),
  openConversation: (userId) => axiosInstance.post(`/chat/open/${userId}`),
  getMessages: (conversationId, page = 1, limit = 50) => axiosInstance.get(`/chat/${conversationId}?page=${page}&limit=${limit}`),
  sendMessage: (conversationId, message) => axiosInstance.post(`/chat/${conversationId}`, { text: message }),
};

// Chatbot API
export const chatbotAPI = {
  analyze: (formData, sessionId) => axiosInstance.post('/chatbot/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(sessionId && { 'x-session-id': sessionId })
    },
  }),
  generateImage: (data) => axiosInstance.post('/chatbot/generate-image', data),
  getSession: (sessionId) => axiosInstance.get(`/chatbot/session/${sessionId}`),
  endSession: (sessionId) => axiosInstance.delete(`/chatbot/session/${sessionId}`),
};

// Admin API
export const adminAPI = {
  login: (data) => axiosInstance.post('/admin/login', data),
  getPendingVerifications: () => axiosInstance.get('/admin/creators/verification/pending'),
  verifyCreator: (creatorId) => axiosInstance.post(`/admin/creators/${creatorId}/verify`),
  rejectCreator: (creatorId, reason) => axiosInstance.post(`/admin/creators/${creatorId}/reject`, { reason }),
  revokeCreator: (creatorId) => axiosInstance.post(`/admin/creators/${creatorId}/revoke`),
  getPriorityReports: () => axiosInstance.get('/admin/reports/priority'),
  moderateUser: (targetId, data) => axiosInstance.post(`/admin/moderate/${targetId}`, data),
  hideContent: (targetType, targetId, reason) => axiosInstance.post(`/admin/content/${targetType}/${targetId}/hide`, { reason }),
  restoreContent: (targetType, targetId) => axiosInstance.post(`/admin/content/${targetType}/${targetId}/restore`),
  removeContent: (targetType, targetId, reason) => axiosInstance.post(`/admin/content/${targetType}/${targetId}/remove`, { reason }),
  resolveReport: (reportId, data) => axiosInstance.post(`/admin/reports/${reportId}/resolve`, data),
  getReportedCreators: () => axiosInstance.get('/admin/reports/creators'),
  getReportDetails: (targetId) => axiosInstance.get(`/admin/reports/details/${targetId}`),
  dismissReports: (targetId) => axiosInstance.delete(`/admin/reports/dismiss/${targetId}`),
  getAdmins: () => axiosInstance.get('/admin/admins/list'),
  getChatbotSessions: () => axiosInstance.get('/chatbot/admin/sessions'),
};
