import apiClient from './client';

export const emergencyApi = {
  trigger: (data: any) => apiClient.post('/emergency', data),
  getAll: () => apiClient.get('/emergency'),
  getById: (id: string) => apiClient.get(`/emergency/${id}`),
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/emergency/${id}/status`, { status }),
  getActive: () => apiClient.get('/emergency/active'),
  getPatientEmergencies: (patientId: string) =>
    apiClient.get(`/emergency/patient/${patientId}`),
};