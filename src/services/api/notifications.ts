// src/services/api/notifications.ts
import apiClient from './client';

export const notificationsApi = {
  getAll: () => apiClient.get('/notifications'),
  getById: (id: string) => apiClient.get(`/notifications/${id}`),
  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),
  delete: (id: string) => apiClient.delete(`/notifications/${id}`),
  getUnreadCount: () => apiClient.get('/notifications/unread-count'),
};