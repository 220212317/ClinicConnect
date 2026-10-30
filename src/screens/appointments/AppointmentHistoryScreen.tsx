import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase/client';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type HistoryFilter = 'all' | 'completed' | 'cancelled' | 'no_show';

interface AppointmentRecord {
  id: string;
  reason_for_visit: string | null;
  status: string;
  created_at: string;
  clinic: {
    clinic_name: string;
    location: string | null;
  }[];
  time_slot: {
    start_time: string;
    date: string;
  }[];
}

const FILTERS: { label: string; value: HistoryFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'No-show', value: 'no_show' },
];

function getStatusLabel(status: string) {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'no_show':
      return 'No-show';
    case 'confirmed':
      return 'Confirmed';
    default:
      return 'Booked';
  }
}

function getAppointmentDate(date: string | undefined, createdAt: string) {
  const parsedDate = new Date(date || createdAt);
  if (Number.isNaN(parsedDate.getTime())) return 'Date unavailable';

  return parsedDate.toLocaleDateString('en-ZA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function isHistoryAppointment(appointment: AppointmentRecord, today: string) {
  if (appointment.status !== 'booked' && appointment.status !== 'confirmed') return true;
  const appointmentDate = appointment.time_slot[0]?.date;
  return Boolean(appointmentDate && appointmentDate < today);
}

export default function AppointmentHistoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 1024;
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!user?.id) {
      setAppointments([]);
      setError('Sign in to view your appointment history.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (patientError) throw patientError;

      const { data, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          reason_for_visit,
          status,
          created_at,
          clinic:clinics (
            clinic_name,
            location
          ),
          time_slot:time_slots (
            start_time,
            date
          )
        `)
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false });
      if (appointmentsError) throw appointmentsError;

      const today = new Date();
      const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const history = ((data || []) as AppointmentRecord[])
        .filter((appointment) => isHistoryAppointment(appointment, todayString));
      setAppointments(history);
    } catch (fetchError) {
      console.error('Failed to load appointment history:', fetchError);
      setError('Unable to load your appointment history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  const filteredAppointments = useMemo(
    () => filter === 'all'
      ? appointments
      : appointments.filter((appointment) => appointment.status === filter),
    [appointments, filter]
  );

  return (
    <View style={styles.root}>
      {isDesktop && (
        <View style={styles.sidebar}>
          <View style={styles.logoRow}>
            <View style={styles.logoBadge}>
              <Ionicons name="add" size={28} color="#FFF" />
            </View>
            <Text style={styles.logoText}>
              Welcome to{'\n'}
              <Text style={styles.logoTextBold}>Clinic</Text>
              <Text style={styles.logoTextAccent}>Connect</Text>
            </Text>
          </View>
          <View style={styles.sidebarIcon}>
            <Ionicons name="time-outline" size={22} color="#FFF" />
          </View>
          <Text style={styles.sidebarLabel}>Appointment history</Text>
        </View>
      )}

      <LinearGradient
        colors={['#B08968', '#FFFFFF', '#FFFFFF']}
        locations={[0, 0.35, 0.6]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.mainContent}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={[styles.scrollContent, isDesktop && styles.scrollContentDesktop]}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.content, isDesktop && styles.contentDesktop]}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Ionicons name="arrow-back" size={20} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.title}>Appointment history</Text>
              <Text style={styles.subtitle}>Your past visits and cancelled appointments</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.sectionLabel}>YOUR APPOINTMENTS</Text>
                {!isLoading && !error && (
                  <Text style={styles.countText}>{appointments.length} total</Text>
                )}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filters}
                accessibilityLabel="Filter appointment history"
              >
                {FILTERS.map((item) => {
                  const selected = filter === item.value;
                  return (
                    <TouchableOpacity
                      key={item.value}
                      onPress={() => setFilter(item.value)}
                      style={[styles.filterButton, selected && styles.filterButtonSelected]}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                    >
                      <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.listCard}>
                {isLoading ? (
                  <View style={styles.stateContainer}>
                    <ActivityIndicator size="large" color="#6B7C5C" />
                    <Text style={styles.stateText}>Loading appointment history...</Text>
                  </View>
                ) : error ? (
                  <View style={styles.stateContainer}>
                    <Ionicons name="alert-circle-outline" size={40} color="#C84C4C" />
                    <Text style={styles.stateText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchHistory}>
                      <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                  </View>
                ) : filteredAppointments.length === 0 ? (
                  <View style={styles.stateContainer}>
                    <Ionicons name="calendar-clear-outline" size={42} color="#B8B8B8" />
                    <Text style={styles.emptyTitle}>
                      {appointments.length === 0
                        ? 'No appointment history yet'
                        : `No ${FILTERS.find((item) => item.value === filter)?.label.toLowerCase()} appointments`}
                    </Text>
                    <Text style={styles.stateText}>
                      {appointments.length === 0
                        ? 'Completed and cancelled appointments will appear here.'
                        : 'Try another filter to see more appointments.'}
                    </Text>
                    {appointments.length === 0 && (
                      <TouchableOpacity
                        style={styles.bookButton}
                        onPress={() => navigation.navigate('BookAppointment', { clinicId: '' })}
                      >
                        <Text style={styles.bookButtonText}>Book an appointment</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  filteredAppointments.map((appointment, index) => {
                    const status = getStatusLabel(appointment.status);
                    const timeSlot = appointment.time_slot[0];
                    const clinic = appointment.clinic[0];
                    return (
                      <TouchableOpacity
                        key={appointment.id}
                        style={[
                          styles.appointmentCard,
                          index === filteredAppointments.length - 1 && styles.appointmentCardLast,
                        ]}
                        onPress={() => navigation.navigate('AppointmentDetail', {
                          appointmentId: appointment.id,
                        })}
                        accessibilityRole="button"
                        accessibilityLabel={`${appointment.reason_for_visit || 'General consultation'}, ${status}`}
                      >
                        <View style={styles.cardHeader}>
                          <Text style={styles.appointmentTitle} numberOfLines={2}>
                            {appointment.reason_for_visit || 'General Consultation'}
                          </Text>
                          <View style={[
                            styles.statusBadge,
                            appointment.status === 'completed' && styles.completedBadge,
                            appointment.status === 'cancelled' && styles.cancelledBadge,
                            appointment.status === 'no_show' && styles.noShowBadge,
                          ]}>
                            <Text style={[
                              styles.statusText,
                              appointment.status === 'completed' && styles.completedText,
                              appointment.status === 'cancelled' && styles.cancelledText,
                              appointment.status === 'no_show' && styles.noShowText,
                            ]}>
                              {status}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.detailRow}>
                          <Ionicons name="calendar-outline" size={15} color="#888" />
                          <Text style={styles.detailText}>
                            {getAppointmentDate(timeSlot?.date, appointment.created_at)}
                            {'  ·  '}
                            {timeSlot?.start_time
                              ? timeSlot.start_time.slice(0, 5)
                              : 'Time unavailable'}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Ionicons name="location-outline" size={15} color="#888" />
                          <Text style={styles.detailText} numberOfLines={1}>
                            {clinic?.clinic_name || clinic?.location || 'Clinic'}
                          </Text>
                        </View>
                        <View style={styles.cardFooter}>
                          <Text style={styles.viewDetails}>VIEW DETAILS</Text>
                          <Ionicons name="chevron-forward" size={14} color="#6B7C5C" />
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  sidebar: {
    width: 260,
    backgroundColor: '#1B2A56',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 36 },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2A3F7A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: { fontSize: 16, color: '#FFF', lineHeight: 22 },
  logoTextBold: { fontWeight: '700' },
  logoTextAccent: { fontWeight: '700', color: '#F2A93B' },
  sidebarIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#2A3F7A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  sidebarLabel: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  mainContent: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  scrollContentDesktop: { alignItems: 'center' },
  content: { width: '100%', maxWidth: 700, alignSelf: 'center' },
  contentDesktop: { maxWidth: 760 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 30, fontWeight: '700', color: '#FFF', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#FFF', opacity: 0.9, marginBottom: 28 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionLabel: { color: '#222', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  countText: { color: '#666', fontSize: 12 },
  filters: { gap: 8, paddingBottom: 16 },
  filterButton: {
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 20,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterButtonSelected: { backgroundColor: '#3F4B6B', borderColor: '#3F4B6B' },
  filterText: { color: '#555', fontSize: 13, fontWeight: '600' },
  filterTextSelected: { color: '#FFF' },
  listCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 20,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  appointmentCard: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#E8E8E8' },
  appointmentCardLast: { borderBottomWidth: 0 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  appointmentTitle: { flex: 1, color: '#222', fontSize: 16, fontWeight: '600' },
  statusBadge: { borderRadius: 12, backgroundColor: '#F1F1F1', paddingHorizontal: 10, paddingVertical: 4 },
  completedBadge: { backgroundColor: '#E8F1E7' },
  cancelledBadge: { backgroundColor: '#FCEBE8' },
  noShowBadge: { backgroundColor: '#FFF3DF' },
  statusText: { color: '#666', fontSize: 11, fontWeight: '600' },
  completedText: { color: '#587451' },
  cancelledText: { color: '#B5473C' },
  noShowText: { color: '#A96A16' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  detailText: { flex: 1, color: '#777', fontSize: 13 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 12 },
  viewDetails: { color: '#6B7C5C', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  stateContainer: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 44 },
  stateText: { color: '#666', fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  emptyTitle: { color: '#333', fontSize: 16, fontWeight: '600', textAlign: 'center', marginTop: 14 },
  retryButton: {
    backgroundColor: '#3F4B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  bookButton: {
    backgroundColor: '#6B7C5C',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 8,
    marginTop: 18,
  },
  bookButtonText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
});