const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    };

    // Si hay body y es FormData, no establecer Content-Type
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      
      // Manejar respuestas no JSON
      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const error = new Error(data.message || data.error || 'Error en la solicitud');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return { data, status: response.status };
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Auth
  async getMe() {
    return this.request('/auth/me');
  }

  async login(matricula, password = null) {
    const payload = password ? { matricula, password } : { matricula };
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
  }

  async registerStudent(matricula) {
    return this.request('/auth/register/student', { method: 'POST', body: JSON.stringify({ matricula }) });
  }

  async registerEntrepreneur(data) {
    return this.request('/auth/register/entrepreneur', { method: 'POST', body: JSON.stringify(data) });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async claimMatricula(data) {
    return this.request('/auth/claim-matricula', { method: 'POST', body: JSON.stringify(data) });
  }

  // Announcements
  async getAnnouncements(cursor = null, category = null) {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    if (category) params.append('category', category);
    const query = params.toString();
    return this.request(`/announcements${query ? `?${query}` : ''}`);
  }

  async getAnnouncement(id) {
    return this.request(`/announcements/${id}`);
  }

  async createAnnouncement(formData) {
    return this.request('/announcements', {
      method: 'POST',
      body: formData,
    });
  }

  async updateAnnouncement(id, data) {
    return this.request(`/announcements/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAnnouncement(id) {
    return this.request(`/announcements/${id}`, { method: 'DELETE' });
  }

  // Interactions
  async toggleLike(announcementId) {
    return this.request(`/announcements/${announcementId}/like`, { method: 'POST' });
  }

  async setRating(announcementId, rating) {
    return this.request(`/announcements/${announcementId}/rating`, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    });
  }

  async removeRating(announcementId) {
    return this.request(`/announcements/${announcementId}/rating`, { method: 'DELETE' });
  }

  // Reports
  async reportAnnouncement(announcementId, reason) {
    return this.request(`/announcements/${announcementId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Projects
  async getProjects() {
    return this.request('/projects');
  }

  async getProject(id) {
    return this.request(`/projects/${id}`);
  }

  async createProject(data) {
    return this.request('/projects', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateProject(id, data) {
    return this.request(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  async updateProjectStatus(id, status) {
    return this.request(`/projects/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  }

  async deleteProject(id) {
    return this.request(`/projects/${id}`, { method: 'DELETE' });
  }

  // Notifications
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', { method: 'PATCH' });
  }

  // Admin
  async getModerationQueue() {
    return this.request('/admin/moderation-queue');
  }

  async approveAnnouncement(id) {
    return this.request(`/admin/announcements/${id}/approve`, { method: 'PATCH' });
  }

  async rejectAnnouncement(id, reason) {
    return this.request(`/admin/announcements/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) });
  }

  async suspendUser(id) {
    return this.request(`/admin/users/${id}/suspend`, { method: 'POST' });
  }

  async getClaimTickets() {
    return this.request('/admin/claim-tickets');
  }

  async resolveClaimTicket(id) {
    return this.request(`/admin/claim-tickets/${id}/resolve`, { method: 'PATCH' });
  }

  async getQRCode() {
    return this.request('/admin/qr', { method: 'GET' });
  }

  // Categories
  async getCategories() {
    return this.request('/categories');
  }
}

const api = new ApiClient();
export default api;