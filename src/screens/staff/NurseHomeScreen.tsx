import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

type PatientStatus = 'waiting' | 'in-progress' | 'vitals-done' | 'escalated' | 'done';

interface QueueItem {
  id: string;
  name: string;
  time: string;
  reason: string;
  status: PatientStatus;
}

const DUMMY_QUEUE: QueueItem[] = [
  { id: 'q1', name: 'Yusrah Adams', time: '08:30', reason: 'Routine blood pressure check', status: 'done' },
  { id: 'q2', name: 'Lesego Mokoena', time: '08:45', reason: 'Wound dressing follow-up', status: 'in-progress' },
  { id: 'q3', name: 'Dikeledi Phiri', time: '09:00', reason: 'Diabetes management', status: 'vitals-done' },
  { id: 'q7', name: 'Thandiwe Molefe', time: '11:00', reason: 'Eye infection treatment', status: 'done' },
  { id: 'q8', name: 'Sipho Dlamini', time: '11:30', reason: 'Chest X-ray results', status: 'in-progress' },
  { id: 'q9', name: 'Naledi Khumalo', time: '12:00', reason: 'Flu symptoms and fever', status: 'waiting' },
];

const DUMMY_PATIENTS = [
  { id: '1', first_name: 'Yusrah', last_name: 'Adams', contact_number: '072 123 4567', date_of_birth: '1990-03-15', gender: 'Female', email: 'yusrah.adams@email.com', address: '14 Main Rd, Claremont', next_of_kin_name: 'Fatima Adams', next_of_kin_contact: '082 345 6789' },
  { id: '2', first_name: 'Lesego', last_name: 'Mokoena', contact_number: '073 234 5678', date_of_birth: '1985-07-22', gender: 'Female', email: 'lesego.m@email.com', address: '22 Lower Maynard Rd, Wynberg', next_of_kin_name: 'Thabo Mokoena', next_of_kin_contact: '071 456 7890' },
  { id: '3', first_name: 'Dikeledi', last_name: 'Phiri', contact_number: '074 345 6789', date_of_birth: '1978-11-08', gender: 'Female', email: 'dikeledi.p@email.com', address: '5 Manenberg Ave, Manenberg', next_of_kin_name: 'Sello Phiri', next_of_kin_contact: '083 567 8901' },
  { id: '7', first_name: 'Thandiwe', last_name: 'Molefe', contact_number: '073 789 0123', date_of_birth: '1988-04-17', gender: 'Female', email: 'thandiwe.m@email.com', address: '10 Fundana Rd, Khayelitsha', next_of_kin_name: 'Bongani Molefe', next_of_kin_contact: '071 901 2345' },
  { id: '8', first_name: 'Sipho', last_name: 'Dlamini', contact_number: '084 890 1234', date_of_birth: '1976-12-03', gender: 'Male', email: 'sipho.d@email.com', address: '6 Hanover Park Ave, Hanover Park', next_of_kin_name: 'Zanele Dlamini', next_of_kin_contact: '073 012 3456' },
  { id: '9', first_name: 'Naledi', last_name: 'Khumalo', contact_number: '078 901 2345', date_of_birth: '1999-08-19', gender: 'Female', email: 'naledi.k@email.com', address: '1 Lansdowne Rd, Philippi', next_of_kin_name: 'Thabiso Khumalo', next_of_kin_contact: '076 123 4567' },
];

const STATS_CONFIG = [
  { label: 'In Queue', icon: 'people' as const, filter: 'in-queue' as const },
  { label: 'Vitals Done', icon: 'checkmark-circle' as const, filter: 'vitals-done' as const },
  { label: 'Escalated', icon: 'alert-circle' as const, filter: 'escalated' as const },
  { label: 'Completed', icon: 'clipboard' as const, filter: 'completed' as const },
];

type FilterType = 'in-queue' | 'vitals-done' | 'escalated' | 'completed' | null;

const STATUS_CONFIG: Record<PatientStatus, { label: string; bg: string; text: string }> = {
  'waiting':     { label: 'Waiting',     bg: '#5B7FC4', text: '#fff' },
  'in-progress': { label: 'In Progress', bg: '#1E2D4E', text: '#fff' },
  'vitals-done': { label: 'Vitals Done', bg: '#5BBB8A', text: '#fff' },
  'escalated':   { label: 'Escalated',   bg: '#E05A5A', text: '#fff' },
  'done':        { label: 'Done',        bg: '#8A9BB8', text: '#fff' },
};

const HEADER_BG = '#0F1B35';
const MAIN_BG = '#F0EDE8';
const CARD_BG = '#1E2D4E';
const QUEUE_BG = '#D9D6D0';

const NurseHomeScreen: React.FC = () => {
  const [queueItems, setQueueItems] = useState<QueueItem[]>(DUMMY_QUEUE);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>(null);
  const navigation = useNavigation();
  const { logout, staffProfile } = useAuth();

  const counts = {
    'in-queue': queueItems.filter((p) => p.status === 'waiting' || p.status === 'in-progress').length,
    'vitals-done': queueItems.filter((p) => p.status === 'vitals-done').length,
    'escalated': queueItems.filter((p) => p.status === 'escalated').length,
    'completed': queueItems.filter((p) => p.status === 'done').length,
  };

  let filteredPatients = selectedFilter === null
    ? queueItems
    : selectedFilter === 'in-queue'
      ? queueItems.filter((p) => p.status === 'waiting' || p.status === 'in-progress')
      : selectedFilter === 'completed'
        ? queueItems.filter((p) => p.status === 'done')
        : queueItems.filter((p) => p.status === selectedFilter);

  const queueTitle = selectedFilter === null
    ? 'Patient Queue'
    : STATS_CONFIG.find((s) => s.filter === selectedFilter)?.label ?? 'Patient Queue';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={HEADER_BG} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('NurseProfile' as never)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{staffProfile?.first_name?.charAt(0) ?? 'N'}</Text>
            </View>
            <View>
              <Text style={styles.headerName}>{staffProfile?.first_name?.charAt(0)}. {staffProfile?.last_name}</Text>
              <Text style={styles.headerRole}>Nurse</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.main}>
        <Text style={styles.pageTitle}>Dashboard</Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {STATS_CONFIG.map((stat) => (
            <TouchableOpacity
              key={stat.label}
              style={[styles.statCard, selectedFilter === stat.filter && styles.statCardActive]}
              onPress={() => setSelectedFilter(selectedFilter === stat.filter ? null : stat.filter)}
            >
              <Ionicons name={stat.icon} size={20} color={selectedFilter === stat.filter ? '#fff' : '#A8B8D0'} />
              <Text style={[styles.statValue, selectedFilter === stat.filter && styles.statValueActive]}>{counts[stat.filter]}</Text>
              <Text style={[styles.statLabel, selectedFilter === stat.filter && styles.statLabelActive]}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Patients Button */}
        <TouchableOpacity style={styles.searchPatientsBtn} onPress={() => navigation.navigate('PatientSearch' as never)}>
          <Ionicons name="search" size={18} color="#fff" />
          <Text style={styles.searchPatientsText}>Search Patients</Text>
        </TouchableOpacity>

        {/* Patient Queue */}
        <View style={styles.queueCard}>
          <View style={styles.queueHeader}>
            <Text style={styles.queueTitle}>{queueTitle}</Text>
            {selectedFilter !== null && (
              <TouchableOpacity onPress={() => setSelectedFilter(null)}>
                <Text style={styles.clearFilter}>Show All</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {filteredPatients.length === 0 ? (
              <Text style={styles.noResults}>No patients found</Text>
            ) : (
              filteredPatients.map((patient, index) => {
                const dummyPatient = DUMMY_PATIENTS.find((p) => `${p.first_name} ${p.last_name}` === patient.name);
                const patientId = dummyPatient?.id || patient.id;
                return (
                <TouchableOpacity key={patient.id} onPress={() => navigation.navigate('PatientDetailView', { patientId } as never)} activeOpacity={0.7}>
                  <View style={styles.queueRow}>
                    <View style={styles.queueInfo}>
                      <Text style={styles.patientName}>{patient.name}</Text>
                      <Text style={styles.apptDetail}>
                        {patient.time} | {patient.reason}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: STATUS_CONFIG[patient.status].bg }]}>
                      <Text style={[styles.badgeText, { color: STATUS_CONFIG[patient.status].text }]}>
                        {STATUS_CONFIG[patient.status].label}
                      </Text>
                    </View>
                  </View>
                  {index < filteredPatients.length - 1 && <View style={styles.rowDivider} />}
                </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: HEADER_BG,
  },

  // Header
  header: {
    backgroundColor: HEADER_BG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3A4F72',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  headerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerRole: {
    color: '#8A9BB8',
    fontSize: 12,
  },

  // Main
  main: {
    flex: 1,
    backgroundColor: MAIN_BG,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 16,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 10,
    minHeight: 70,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  statCardActive: {
    backgroundColor: '#5B7FC4',
  },
  statValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  statValueActive: {
    color: '#fff',
  },
  statLabel: {
    color: '#A8B8D0',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  statLabelActive: {
    color: '#fff',
  },

  // Search Patients Button
  searchPatientsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E2D4E',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  searchPatientsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Queue
  queueCard: {
    backgroundColor: QUEUE_BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flex: 1,
  },
  queueTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  queueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearFilter: {
    fontSize: 12,
    color: '#5B7FC4',
    fontWeight: '600',
  },

  noResults: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    paddingVertical: 20,
  },

  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  queueInfo: {
    flex: 1,
    paddingRight: 12,
  },
  patientName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 2,
  },
  apptDetail: {
    fontSize: 12,
    color: '#555',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#C4C1BB',
  },

  // Badge
  badge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default NurseHomeScreen;
