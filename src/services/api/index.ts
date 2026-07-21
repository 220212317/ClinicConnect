import apiClient from './client';
import { supabase } from '../supabase/client';


import { authApi } from './auth';
import { staffApi } from './staff';
import { clinicApi } from './clinic';
import { serviceApi } from './services';
import { timeSlotApi } from './timeslots';
import { adminDashboardApi } from './admin';
import { patientApi } from './patient';
import { emergencyApi } from './emergency';
import { appointmentsApi } from './appointments';
import { notificationsApi } from './notifications';
import { medicalApi } from './medical';
import { profileApi, PatientProfile, CreateProfileData, UpdateProfileData } from './profile';


export { supabase };


export {
  apiClient,
  authApi,
  staffApi,
  clinicApi,
  serviceApi,
  timeSlotApi,
  adminDashboardApi,
  patientApi,
  emergencyApi,
  appointmentsApi,
  notificationsApi,
  medicalApi,
  profileApi,
  PatientProfile,
  CreateProfileData,
  UpdateProfileData,
};


const api = {
  client: apiClient,
  supabase,
  auth: authApi,
  staff: staffApi,
  clinics: clinicApi,
  services: serviceApi,
  timeSlots: timeSlotApi,
  adminDashboard: adminDashboardApi,
  patient: patientApi,
  emergency: emergencyApi,
  appointments: appointmentsApi,
  notifications: notificationsApi,
  medical: medicalApi,
  profile: profileApi,
};

export default api;