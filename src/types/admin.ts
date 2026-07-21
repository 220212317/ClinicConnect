export interface Staff {
  id: string;
  staffRegNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  role: 'Doctor' | 'Nurse' | 'Admin' | 'FirstResponder';
  clinicId: string;
  clinicName?: string;
  status: 'active' | 'inactive';
  // Role-specific fields
  specialization?: string;
  licenseNumber?: string;
  department?: string;
  responseUnit?: string;
  ambulanceNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Clinic {
  id: string;
  clinicName: string;
  location: string;
  operatingHours: string;
  contactDetails: string;
  status: 'active' | 'inactive';
  serviceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  serviceName: string;
  clinicId: string;
  clinicName?: string;
  description: string;
  estimatedDuration: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  id: string;
  clinicId: string;
  clinicName?: string;
  serviceId: string;
  serviceName?: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

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

export interface ClinicDetails extends Clinic {
  services: Omit<Service, 'clinicId' | 'clinicName'>[];
  staff: Pick<Staff, 'id' | 'firstName' | 'lastName' | 'role'>[];
  timeSlots: Pick<TimeSlot, 'id' | 'date' | 'startTime' | 'endTime' | 'isAvailable'>[];
}