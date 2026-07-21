export type UserRole = 'patient' | 'doctor' | 'nurse' | 'admin' | 'paramedic';

export interface RoleConfig {
  label: string;
  description: string;
  icon: string;
  homeScreen: string;
}

export const STAFF_ROLES: Record<Exclude<UserRole, 'patient'>, RoleConfig> = {
  doctor: {
    label: 'Doctor',
    description: 'Manage consultations, patient records, and prescriptions',
    icon: 'medkit',
    homeScreen: 'DoctorHome',
  },
  nurse: {
    label: 'Nurse',
    description: 'Assist with patient care, vitals, and triage',
    icon: 'heart',
    homeScreen: 'NurseHome',
  },
  admin: {
    label: 'Admin',
    description: 'Manage staff, clinics, and system settings',
    icon: 'shield',
    homeScreen: 'AdminDashboard',
  },
  paramedic: {
    label: 'Paramedic',
    description: 'Respond to emergencies and manage field reports',
    icon: 'car',
    homeScreen: 'ParamedicHome',
  },
};
