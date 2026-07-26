import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase/client';

type PatientStatus = 'waiting' | 'in-progress' | 'vitals-done' | 'escalated' | 'done';

interface QueueItem {
  id: string;
  patientId: string;
  name: string;
  time: string;
  reason: string;
  status: PatientStatus;
}

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

const mapAppointmentStatus = (status: string): PatientStatus => {
  switch (status) {
    case 'booked': return 'waiting';
    case 'confirmed': return 'in-progress';
    case 'completed': return 'done';
    case 'cancelled': return 'done';
    case 'no_show': return 'done';
    default: return 'waiting';
  }
};

const NurseHomeScreen: React.FC = () => {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const { logout, staffProfile } = useAuth();

  const fetchQueue = useCallback(async () => {
    if (!staffProfile?.clinic_id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select(`
          id,
          patient_id,
          reason_for_visit,
          status,
          created_at,
          patient:patients!appointments_patient_id_fkey (
            first_name,
            last_name
          ),
          time_slot:time_slots!appointments_time_slot_id_fkey (
            start_time,
            date
          )
        `)
        .eq('clinic_id', staffProfile.clinic_id)
        .eq('time_slot.date', today)
        .not('status', 'eq', 'cancelled')
        .not('status', 'eq', 'no_show')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const queue: QueueItem[] = (appointmentsData || []).map((appt: any) => ({
        id: appt.id,
        patientId: appt.patient_id,
        name: `${appt.patient?.first_name || ''} ${appt.patient?.last_name || ''}`.trim(),
        time: appt.time_slot?.start_time || new Date(appt.created_at).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false }),
        reason: appt.reason_for_visit || 'General consultation',
        status: mapAppointmentStatus(appt.status),
      }));

      setQueueItems(queue);
    } catch (err) {
      console.error('Error fetching queue:', err);
    } finally {
      setIsLoading(false);
    }
  }, [staffProfile?.clinic_id]);

  useFocusEffect(
    useCallback(() => {
      fetchQueue();
    }, [fetchQueue])
  );

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
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5B7FC4" />
                <Text style={styles.loadingText}>Loading queue...</Text>
              </View>
            ) : filteredPatients.length === 0 ? (
              <Text style={styles.noResults}>No patients found</Text>
            ) : (
              filteredPatients.map((patient, index) => (
                <TouchableOpacity key={patient.id} onPress={() => navigation.navigate('PatientDetailView', { patientId: patient.patientId } as never)} activeOpacity={0.7}>
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
              ))
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#888',
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
