// src/types/patient.ts
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