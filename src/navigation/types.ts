// src/navigation/types.ts
export type RootStackParamList = {
  // Auth
  Login: undefined;
  StaffLogin: undefined;  // ← Add this
  ForgotPassword: undefined;
  RegisterStep1: undefined;
  RegisterStep2: { [key: string]: any };
  
  // Patient Screens
  PatientHome: { [key: string]: any };
  PatientProfile: { patientId?: string };
  MedicalRecord: { patientId?: string };
  NearbyClinics: undefined;
  BookAppointment: { clinicId: string };
  AppointmentDetail: { appointmentId: string };
  Notifications: undefined;
  Emergency: undefined;
  EmergencySuccess: undefined;
  HealthTips: undefined;
  Alerts: undefined;
  ClinicDetails: { clinicId: string };
  ServiceDetails: { serviceId: string };
  
  // Admin/Staff Screens
  AdminDashboard: undefined;
  StaffList: undefined;
  StaffDetails: { staffId: string };
  AddStaff: undefined;
  ClinicManagement: undefined;
  ClinicDetailsScreen: { clinicId: string };
  ServiceManagement: undefined;
  TimeSlotManagement: undefined;

  DoctorHome: undefined;
  NurseHome: undefined;
  NurseProfile: undefined;
  PatientDetailView: { patientId: string };
  PatientSearch: undefined;
  FirstResponderHome: undefined;
  FirstResponderProfile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}