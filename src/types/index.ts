// src/types/index.ts

// ============================================================
// NAVIGATION TYPES
// ============================================================
export type { RootStackParamList } from '../navigation/types';

// ============================================================
// AUTH TYPES
// ============================================================
export interface User {
  id: string;
  auth_id: string | null;
  email: string;
  role: 'patient' | 'doctor' | 'nurse' | 'admin' | 'first_responder';
  status: 'active' | 'inactive' | 'suspended';
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  role?: 'patient' | 'doctor' | 'nurse' | 'admin' | 'first_responder';
}

// ============================================================
// PATIENT TYPES
// ============================================================
export interface Address {
  streetNumber?: string;
  streetName?: string;
  city?: string;
  postalCode?: string;
  province?: string;
}

export interface NotificationPreference {
  sms: boolean;
  email: boolean;
  inApp: boolean;
}

export interface Patient {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  contact_number: string | null;
  id_number: string | null;
  gender: 'Male' | 'Female' | 'Other' | null;
  ethnicity: 'African' | 'Coloured' | 'Indian/Asian' | 'White' | 'Other' | null;
  date_of_birth: string | null;
  address: Address | null;
  next_of_kin_name: string | null;
  next_of_kin_relation: string | null;
  next_of_kin_contact: string | null;
  notification_preference: NotificationPreference;
  medical_aid_number: string | null;
  medical_aid_plan: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface PatientProfile extends Patient {
  full_name: string;
}

export interface UpdatePatientData {
  first_name?: string;
  last_name?: string;
  contact_number?: string;
  id_number?: string;
  gender?: 'Male' | 'Female' | 'Other';
  ethnicity?: 'African' | 'Coloured' | 'Indian/Asian' | 'White' | 'Other';
  address?: Address;
  next_of_kin_name?: string;
  next_of_kin_relation?: string;
  next_of_kin_contact?: string;
  notification_preference?: NotificationPreference;
}

// ============================================================
// CLINIC TYPES
// ============================================================
export interface Clinic {
  id: string;
  clinic_name: string;
  location: string;
  address: string | null;
  phone: string | null;
  facility_type: 'Clinic' | 'CDC' | 'Satellite' | 'Mobile' | null;
  latitude: number | null;
  longitude: number | null;
  operating_hours: string | null;
  contact_details: string | null;
  website: string | null;
  email: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ClinicWithDistance extends Clinic {
  distance_km: number;
  distance_display: string;
  is_open: boolean;
  has_maternity: boolean;
  services: Service[];
}

export interface ClinicDetails extends Clinic {
  services: Service[];
  staff: Staff[];
  time_slots: TimeSlot[];
}

export interface CreateClinicData {
  clinic_name: string;
  location: string;
  address?: string;
  phone?: string;
  facility_type?: 'Clinic' | 'CDC' | 'Satellite' | 'Mobile';
  latitude?: number | null;
  longitude?: number | null;
  operating_hours?: string;
  contact_details?: string;
  website?: string;
  email?: string;
}

export interface UpdateClinicData extends Partial<CreateClinicData> {
  status?: 'active' | 'inactive';
}

// ============================================================
// STAFF TYPES
// ============================================================
export interface Staff {
  id: string;
  user_id: string | null;
  staff_reg_number: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string | null;
  role: 'Doctor' | 'Nurse' | 'Admin' | 'FirstResponder';
  clinic_id: string | null;
  specialization: string | null;
  license_number: string | null;
  department: string | null;
  response_unit: string | null;
  ambulance_number: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface StaffWithClinic extends Staff {
  clinic: Clinic | null;
}

export interface CreateStaffData {
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  role: 'Doctor' | 'Nurse' | 'Admin' | 'FirstResponder';
  clinic_id: string;
  specialization?: string;
  license_number?: string;
  department?: string;
  response_unit?: string;
  ambulance_number?: string;
}

// ============================================================
// SERVICE TYPES
// ============================================================
export interface Service {
  id: string;
  clinic_id: string;
  service_name: string;
  description: string | null;
  estimated_duration: string | null;
  price: number | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ServiceWithClinic extends Service {
  clinic: Clinic | null;
}

export interface CreateServiceData {
  service_name: string;
  clinic_id: string;
  description?: string;
  estimated_duration?: string;
  price?: number;
}

// ============================================================
// TIME SLOT TYPES
// ============================================================
export interface TimeSlot {
  id: string;
  clinic_id: string;
  service_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_patients: number;
  booked_count: number;
  created_at: string;
  updated_at: string;
}

export interface TimeSlotWithDetails extends TimeSlot {
  clinic: Clinic | null;
  service: Service | null;
}

export interface CreateTimeSlotData {
  clinic_id: string;
  service_id: string;
  date: string;
  start_time: string;
  end_time: string;
  max_patients?: number;
}

// ============================================================
// APPOINTMENT TYPES
// ============================================================
export interface Appointment {
  id: string;
  patient_id: string;
  clinic_id: string;
  time_slot_id: string | null;
  service_id: string | null;
  reason_for_visit: string | null;
  status: 'booked' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentWithDetails extends Appointment {
  patient: Patient | null;
  clinic: Clinic | null;
  time_slot: TimeSlot | null;
  service: Service | null;
}

export interface CreateAppointmentData {
  patient_id: string;
  clinic_id: string;
  time_slot_id: string;
  service_id?: string;
  reason_for_visit?: string;
}

// ============================================================
// MEDICAL RECORD TYPES
// ============================================================
export interface Vitals {
  blood_pressure?: string;
  heart_rate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  appointment_id: string | null;
  visit_date: string;
  diagnosis_notes: string | null;
  allergies: string[];
  chronic_medication: string[];
  vitals: Vitals | null;
  treatment_plan: string | null;
  follow_up_date: string | null;
  doctor_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecordWithPatient extends MedicalRecord {
  patient: Patient | null;
  appointment: Appointment | null;
}

export interface CreateMedicalRecordData {
  patient_id: string;
  appointment_id?: string;
  visit_date: string;
  diagnosis_notes?: string;
  allergies?: string[];
  chronic_medication?: string[];
  vitals?: Vitals;
  treatment_plan?: string;
  follow_up_date?: string;
  doctor_notes?: string;
}

// ============================================================
// NOTIFICATION TYPES
// ============================================================
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'appointment_reminder' | 'alert' | 'general' | 'emergency' | 'system';
  is_read: boolean;
  read_at: string | null;
  data: Record<string, any> | null;
  sent_at: string;
  created_at: string;
}

export interface CreateNotificationData {
  user_id: string;
  title: string;
  message: string;
  type: 'appointment_reminder' | 'alert' | 'general' | 'emergency' | 'system';
  data?: Record<string, any>;
}

// ============================================================
// EMERGENCY TYPES
// ============================================================
export interface GeoLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface EmergencyAlert {
  id: string;
  patient_id: string;
  responder_id: string | null;
  location: GeoLocation;
  timestamp: string;
  emergency_status: 'pending' | 'dispatched' | 'resolved' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string | null;
  notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEmergencyAlertData {
  patient_id: string;
  location: GeoLocation;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
}

// ============================================================
// HEALTH TIP TYPES
// ============================================================
export interface HealthTip {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'nutrition' | 'exercise' | 'mental_health' | 'prevention' | 'chronic' | null;
  image_url: string | null;
  source: string | null;
  is_featured: boolean;
  views: number;
  likes: number;
  status: 'draft' | 'published' | 'archived';
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateHealthTipData {
  title: string;
  content: string;
  category?: 'general' | 'nutrition' | 'exercise' | 'mental_health' | 'prevention' | 'chronic';
  image_url?: string;
  source?: string;
  is_featured?: boolean;
}

// ============================================================
// FILTER AND SEARCH TYPES
// ============================================================
export interface ClinicSearchFilters {
  query?: string;
  facility_type?: 'Clinic' | 'CDC' | 'Satellite' | 'Mobile' | 'all';
  latitude?: number;
  longitude?: number;
  max_distance?: number;
  status?: 'active' | 'inactive' | 'all';
}

export interface AppointmentFilters {
  patient_id?: string;
  clinic_id?: string;
  status?: 'booked' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'all';
  date_from?: string;
  date_to?: string;
}

export interface PatientSearchFilters {
  query?: string;
  status?: 'active' | 'inactive' | 'all';
}

// ============================================================
// DASHBOARD TYPES
// ============================================================
export interface DashboardStats {
  totalStaff: number;
  totalClinics: number;
  totalServices: number;
  totalAppointments: number;
  activeEmergencies: number;
  pendingStaffRequests: number;
}

export interface DashboardActivity {
  id: string;
  type: 'staff_added' | 'clinic_updated' | 'appointment' | 'emergency';
  description: string;
  timestamp: string;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================
// LOCATION TYPES
// ============================================================
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// ============================================================
// ENUMS (Type Aliases)
// ============================================================
export type UserRole = 'patient' | 'doctor' | 'nurse' | 'admin' | 'first_responder';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type Gender = 'Male' | 'Female' | 'Other';
export type Ethnicity = 'African' | 'Coloured' | 'Indian/Asian' | 'White' | 'Other';
export type FacilityType = 'Clinic' | 'CDC' | 'Satellite' | 'Mobile';
export type StaffRole = 'Doctor' | 'Nurse' | 'Admin' | 'FirstResponder';
export type AppointmentStatus = 'booked' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type EmergencyStatus = 'pending' | 'dispatched' | 'resolved' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type NotificationType = 'appointment_reminder' | 'alert' | 'general' | 'emergency' | 'system';
export type HealthTipCategory = 'general' | 'nutrition' | 'exercise' | 'mental_health' | 'prevention' | 'chronic';
export type HealthTipStatus = 'draft' | 'published' | 'archived';
export type FilterOption = 'all' | 'open' | 'nearby' | 'antenatal';
export type SortOption = 'distance' | 'rating' | 'name';