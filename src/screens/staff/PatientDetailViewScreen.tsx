import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase/client';

const HEADER_BG = '#0F1B35';

interface DummyPatientData {
  id: string;
  first_name: string;
  last_name: string;
  contact_number: string | null;
  date_of_birth: string | null;
  gender: string | null;
  email: string | null;
  address: string | null;
  id_number: string | null;
  next_of_kin_name: string | null;
  next_of_kin_contact: string | null;
}

interface QueueEntry {
  id: string;
  patientId: string;
  time: string;
  reason: string;
  status: string;
}

const DUMMY_PATIENTS: DummyPatientData[] = [
  { id: '1', first_name: 'Yusrah', last_name: 'Adams', contact_number: '072 123 4567', date_of_birth: '1990-03-15', gender: 'Female', email: 'yusrah.adams@email.com', address: '14 Main Rd, Claremont', id_number: '9003150012345', next_of_kin_name: 'Fatima Adams', next_of_kin_contact: '082 345 6789' },
  { id: '2', first_name: 'Lesego', last_name: 'Mokoena', contact_number: '073 234 5678', date_of_birth: '1985-07-22', gender: 'Female', email: 'lesego.m@email.com', address: '22 Lower Maynard Rd, Wynberg', id_number: '8507220023456', next_of_kin_name: 'Sino Mokoena', next_of_kin_contact: '071 456 7890' },
  { id: '3', first_name: 'Dikeledi', last_name: 'Phiri', contact_number: '074 345 6789', date_of_birth: '1978-11-08', gender: 'Female', email: 'dikeledi.p@email.com', address: '5 Manenberg Ave, Manenberg', id_number: '7811080034567', next_of_kin_name: 'Sello Lawana', next_of_kin_contact: '083 567 8901' },
  { id: '7', first_name: 'Thandiwe', last_name: 'Molefe', contact_number: '073 789 0123', date_of_birth: '1988-04-17', gender: 'Female', email: 'thandiwe.m@email.com', address: '10 Fundana Rd, Khayelitsha', id_number: '8804170078901', next_of_kin_name: 'Theo Majola', next_of_kin_contact: '071 901 2345' },
  { id: '8', first_name: 'Sipho', last_name: 'Dlamini', contact_number: '084 890 1234', date_of_birth: '1976-12-03', gender: 'Male', email: 'sipho.d@email.com', address: '6 Hanover Park Ave, Hanover Park', id_number: '7612030089012', next_of_kin_name: 'Zanele Dlamini', next_of_kin_contact: '073 012 3456' },
  { id: '9', first_name: 'Naledi', last_name: 'Khumalo', contact_number: '078 901 2345', date_of_birth: '1999-08-19', gender: 'Female', email: 'naledi.k@email.com', address: '1 Lansdowne Rd, Philippi', id_number: '9908190090123', next_of_kin_name: 'Thabiso Khumalo', next_of_kin_contact: '076 123 4567' },
];

const DUMMY_QUEUE: QueueEntry[] = [
  { id: 'q1', patientId: '1', time: '08:30', reason: 'Routine blood pressure check', status: 'done' },
  { id: 'q2', patientId: '2', time: '08:45', reason: 'Wound dressing follow-up', status: 'in-progress' },
  { id: 'q3', patientId: '3', time: '09:00', reason: 'Diabetes management', status: 'vitals-done' },
  { id: 'q7', patientId: '7', time: '11:00', reason: 'Eye infection treatment', status: 'done' },
  { id: 'q8', patientId: '8', time: '11:30', reason: 'Chest X-ray results', status: 'in-progress' },
  { id: 'q9', patientId: '9', time: '12:00', reason: 'Flu symptoms and fever', status: 'waiting' },
];

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

const DUMMY_APPOINTMENTS_HISTORY: (AppointmentRecord & { patientId: string })[] = [
  // Patient 1 - Yusrah Adams (Claremont area)
  { id: 'a1', patientId: '1', clinic_id: 'cClaremont', clinic_name: 'Claremont Clinic', reason_for_visit: 'Blood pressure check-up', status: 'completed', notes: null, created_at: daysAgo(60) },
  // Patient 2 - Lesego Mokoena (Wynberg area)
  { id: 'a2', patientId: '2', clinic_id: 'cWynberg', clinic_name: 'Wynberg Clinic', reason_for_visit: 'Wound dressing', status: 'completed', notes: null, created_at: daysAgo(90) },
  // Patient 3 - Dikeledi Phiri (Manenberg area)
  { id: 'a3', patientId: '3', clinic_id: 'cManenberg', clinic_name: 'Manenberg Clinic', reason_for_visit: 'Diabetes management review', status: 'completed', notes: null, created_at: daysAgo(60) },
  // Patient 7 - Thandiwe Molefe (Khayelitsha area)
  { id: 'a7', patientId: '7', clinic_id: 'cMayenzeke', clinic_name: 'Mayenzeke Clinic', reason_for_visit: 'Eye infection treatment', status: 'completed', notes: null, created_at: daysAgo(60) },
  // Patient 8 - Sipho Dlamini (Hanover Park area)
  { id: 'a8', patientId: '8', clinic_id: 'cHanoverPark', clinic_name: 'Hanover Park Clinic', reason_for_visit: 'Chest X-ray', status: 'completed', notes: null, created_at: daysAgo(120) },
  // Patient 9 - Naledi Khumalo (Philippi area)
  { id: 'a9', patientId: '9', clinic_id: 'cPhilippi', clinic_name: 'Philippi Clinic', reason_for_visit: 'Flu treatment', status: 'completed', notes: null, created_at: daysAgo(60) },
];

interface PatientProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  contact_number: string | null;
  id_number: string | null;
  gender: string | null;
  date_of_birth: string | null;
  address: {
    streetNumber?: string;
    streetName?: string;
    city?: string;
    postalCode?: string;
    province?: string;
  } | null;
  next_of_kin_name: string | null;
  next_of_kin_contact: string | null;
}

interface AppointmentRecord {
  id: string;
  clinic_id: string;
  clinic_name: string;
  reason_for_visit: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

const APPT_STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  booked:     { label: 'Booked',     bg: '#5B7FC4', text: '#fff' },
  confirmed:  { label: 'Confirmed',  bg: '#1E2D4E', text: '#fff' },
  completed:  { label: 'Completed',  bg: '#5BBB8A', text: '#fff' },
  cancelled:  { label: 'Cancelled',  bg: '#8A9BB8', text: '#fff' },
  no_show:    { label: 'No Show',    bg: '#E05A5A', text: '#fff' },
};

export default function PatientDetailViewScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<any, any>>();
  const { role, staffProfile } = useAuth();

  const { patientId } = route.params || { patientId: '' };

  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!patientId) {
      setError('No patient ID provided');
      setIsLoading(false);
      return;
    }

    if (role !== 'Doctor' && role !== 'Nurse') {
      setError('Access restricted to medical staff');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Try dummy data first
      const dummyPatient = DUMMY_PATIENTS.find((p) => p.id === patientId);

      if (dummyPatient) {
        const mappedPatient: PatientProfile = {
          id: dummyPatient.id,
          first_name: dummyPatient.first_name,
          last_name: dummyPatient.last_name,
          email: dummyPatient.email,
          contact_number: dummyPatient.contact_number,
          id_number: dummyPatient.id_number,
          gender: dummyPatient.gender,
          date_of_birth: dummyPatient.date_of_birth,
          address: dummyPatient.address ? { city: dummyPatient.address } : null,
          next_of_kin_name: dummyPatient.next_of_kin_name,
          next_of_kin_contact: dummyPatient.next_of_kin_contact,
        };
        setPatient(mappedPatient);

        // Get past appointments for this patient from history
        const pastAppts = DUMMY_APPOINTMENTS_HISTORY.filter((a) => a.patientId === patientId);

        // Get today's queue entry for this patient
        const patientQueue = DUMMY_QUEUE.filter((q) => q.patientId === patientId);
        const todayAppts: AppointmentRecord[] = patientQueue.map((q) => ({
          id: q.id,
          clinic_id: 'cMasincedane',
          clinic_name: 'Masincedane Clinic',
          reason_for_visit: q.reason,
          status: q.status === 'done' ? 'completed' : q.status === 'escalated' ? 'booked' : 'confirmed',
          notes: null,
          created_at: new Date().toISOString(),
        }));

        setAppointments([...pastAppts, ...todayAppts]);
        setIsLoading(false);
        return;
      }

      // Fallback to Supabase
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .maybeSingle();

      if (patientError) throw patientError;

      if (!patientData) {
        setError('Patient not found');
        setIsLoading(false);
        return;
      }

      setPatient(patientData as PatientProfile);

      const { data: apptData, error: apptError } = await supabase
        .from('appointments')
        .select('*, clinics!appointments_clinic_id_fkey(clinic_name)')
        .eq('patient_id', patientId)
        .eq('clinic_id', staffProfile?.clinic_id || '')
        .order('created_at', { ascending: false });

      if (apptError) throw apptError;

      const mappedAppts: AppointmentRecord[] = (apptData || []).map((a: any) => ({
        id: a.id,
        clinic_id: a.clinic_id,
        clinic_name: a.clinics?.clinic_name || 'Unknown Clinic',
        reason_for_visit: a.reason_for_visit,
        status: a.status,
        notes: a.notes,
        created_at: a.created_at,
      }));

      setAppointments(mappedAppts);
    } catch (err: any) {
      console.error('Error fetching patient data:', err);
      setError(err.message || 'Failed to load patient data');
    } finally {
      setIsLoading(false);
    }
  }, [patientId, role, staffProfile?.clinic_id]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleViewRecords = () => {
    navigation.navigate('MedicalRecord', { patientId });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B7FC4" />
          <Text style={styles.loadingText}>Loading patient data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !patient) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#0F1B35', '#1E2D4E', '#F5F5F5']}
          locations={[0, 0.15, 0.4]}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Patient Details</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#CCC" />
            <Text style={styles.errorTitle}>Patient Not Found</Text>
            <Text style={styles.errorText}>{error || 'No patient data available'}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const fullName = `${patient.first_name} ${patient.last_name}`.trim();
  const initials = `${patient.first_name[0]}${patient.last_name[0]}`.toUpperCase();

  const queueEntry = DUMMY_QUEUE.find((q) => q.patientId === patientId);
  const queueStatus = queueEntry?.status || null;

  const QUEUE_STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
    'waiting':     { label: 'Waiting',     bg: '#5B7FC4', text: '#fff' },
    'in-progress': { label: 'In Progress', bg: '#1E2D4E', text: '#fff' },
    'vitals-done': { label: 'Vitals Done', bg: '#5BBB8A', text: '#fff' },
    'escalated':   { label: 'Escalated',   bg: '#E05A5A', text: '#fff' },
    'done':        { label: 'Done',        bg: '#8A9BB8', text: '#fff' },
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not specified';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      <LinearGradient
        colors={['#0F1B35', '#1E2D4E', '#F5F5F5']}
        locations={[0, 0.15, 0.4]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Patient Details</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Patient Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{fullName}</Text>
              <Text style={styles.profileSub}>
                {patient.gender ? `${patient.gender}` : ''}
                {patient.gender && patient.date_of_birth ? ' \u2022 ' : ''}
                {patient.date_of_birth ? `DOB: ${formatDate(patient.date_of_birth)}` : ''}
              </Text>
              {queueStatus && (
                <View style={[styles.queueStatusBadge, { backgroundColor: QUEUE_STATUS_CONFIG[queueStatus]?.bg || '#8A9BB8' }]}>
                  <Text style={[styles.queueStatusText, { color: QUEUE_STATUS_CONFIG[queueStatus]?.text || '#fff' }]}>
                    {QUEUE_STATUS_CONFIG[queueStatus]?.label || queueStatus}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Contact Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CONTACT DETAILS</Text>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Patient ID</Text>
              <Text style={styles.detailValue}>{patient.id}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{patient.email || 'Not specified'}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Contact</Text>
              <Text style={styles.detailValue}>{patient.contact_number || 'Not specified'}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>ID Number</Text>
              <Text style={styles.detailValue}>{patient.id_number || 'Not specified'}</Text>
            </View>

            {patient.address && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Address</Text>
                <Text style={styles.detailValue}>
                  {`${patient.address.streetNumber || ''} ${patient.address.streetName || ''}, ${patient.address.city || ''}`.trim() || 'Not specified'}
                </Text>
              </View>
            )}
          </View>

          {/* Next of Kin */}
          {patient.next_of_kin_name && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>NEXT OF KIN</Text>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Name</Text>
                <Text style={styles.detailValue}>{patient.next_of_kin_name}</Text>
              </View>

              {patient.next_of_kin_contact && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Contact</Text>
                  <Text style={styles.detailValue}>{patient.next_of_kin_contact}</Text>
                </View>
              )}
            </View>
          )}

          {/* Appointment History */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>APPOINTMENT HISTORY</Text>

            {appointments.length === 0 ? (
              <Text style={styles.emptyText}>No appointment history found</Text>
            ) : (
              appointments.map((appt, index) => (
                <View key={appt.id}>
                  <View style={styles.apptRow}>
                    <View style={styles.apptInfo}>
                      <Text style={styles.apptClinic}>{appt.clinic_name}</Text>
                      <Text style={styles.apptDate}>{formatDateTime(appt.created_at)}</Text>
                      {appt.reason_for_visit && (
                        <Text style={styles.apptReason}>{appt.reason_for_visit}</Text>
                      )}
                    </View>
                    <View style={[styles.badge, { backgroundColor: APPT_STATUS_CONFIG[appt.status]?.bg || '#8A9BB8' }]}>
                      <Text style={[styles.badgeText, { color: APPT_STATUS_CONFIG[appt.status]?.text || '#fff' }]}>
                        {APPT_STATUS_CONFIG[appt.status]?.label || appt.status}
                      </Text>
                    </View>
                  </View>
                  {index < appointments.length - 1 && <View style={styles.rowDivider} />}
                </View>
              ))
            )}
          </View>

          {/* View Medical Records Button */}
          <TouchableOpacity style={styles.recordsButton} onPress={handleViewRecords}>
            <Ionicons name="medical-outline" size={20} color="#fff" />
            <Text style={styles.recordsButtonText}>View Medical Records</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: HEADER_BG,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },

  // Error
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#5B7FC4',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Profile Header
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1E2D4E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  profileSub: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  queueStatusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
  },
  queueStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Sections
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  // Details
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#888',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
    flex: 1.5,
    textAlign: 'right',
  },

  // Appointments
  apptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  apptInfo: {
    flex: 1,
    paddingRight: 12,
  },
  apptClinic: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  apptDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  apptReason: {
    fontSize: 12,
    color: '#555',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  emptyText: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 16,
  },

  // Badge
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Records Button
  recordsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E2D4E',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordsButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
