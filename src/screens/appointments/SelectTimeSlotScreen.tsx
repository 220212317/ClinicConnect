// src/screens/appointments/SelectTimeSlotScreen.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { clinicApi, ClinicTimeSlot } from '../../services/api/clinic';
import { Dropdown } from '../../components/Dropdown';
import { useAuth } from '../../context/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SelectTimeSlotRouteProp = RouteProp<RootStackParamList, 'SelectTimeSlot'>;

export default function SelectTimeSlotScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SelectTimeSlotRouteProp>();
  const { clinicId, serviceId } = route.params;
  const { width } = useWindowDimensions();
  const { profile, staffProfile } = useAuth();

  const [allSlots, setAllSlots] = useState<ClinicTimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [comments, setComments] = useState('');

  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 1024;

  const getInitials = () => {
    const first = profile?.first_name || staffProfile?.first_name || '';
    const last = profile?.last_name || staffProfile?.last_name || '';
    if (!first && !last) return '?';
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  const fetchSlots = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await clinicApi.getTimeSlots(clinicId);
      const availableForService = (data as ClinicTimeSlot[]).filter(
        (slot) => slot.service_id === serviceId && slot.is_available
      );
      setAllSlots(availableForService);
    } catch (err: any) {
      console.error('Failed to fetch time slots:', err);
      setError('Unable to load available slots. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [clinicId, serviceId]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTimeDisplay = (start: string, end: string) => `${start} - ${end}`;

  const dateOptions = useMemo(() => {
    const unique = Array.from(new Set(allSlots.map((s) => s.date))).sort();
    return unique.map(formatDateDisplay);
  }, [allSlots]);

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return allSlots
      .filter((s) => formatDateDisplay(s.date) === selectedDate)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [allSlots, selectedDate]);

  const timeOptions = useMemo(
    () => slotsForSelectedDate.map((s) => formatTimeDisplay(s.start_time, s.end_time)),
    [slotsForSelectedDate]
  );

  const handleSelectDate = (dateDisplay: string) => {
    setSelectedDate(dateDisplay);
    setSelectedTime('');
  };

  const canContinue = selectedDate !== '' && selectedTime !== '';

  const handleContinue = () => {
    if (!canContinue) return;

    const matchedSlot = slotsForSelectedDate.find(
      (s) => formatTimeDisplay(s.start_time, s.end_time) === selectedTime
    );
    if (!matchedSlot) return;

    navigation.navigate('ConfirmBooking' as any, {
      clinicId,
      serviceId,
      timeSlotId: matchedSlot.id,
      comments,
    });
  };

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
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
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
            contentContainerStyle={[styles.scrollContent, !isDesktop && styles.scrollContentMobile]}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.title}>Book an appointment</Text>
            <Text style={styles.stepText}>Step 3 of 4 - Pick a Slot</Text>

            <Text style={styles.sectionLabel}>PICK A SLOT</Text>

            <View style={styles.formCard}>
              {isLoading && (
                <View style={styles.stateContainer}>
                  <ActivityIndicator size="large" color="#4A90D9" />
                  <Text style={styles.stateText}>Loading available slots...</Text>
                </View>
              )}

              {!isLoading && error && (
                <View style={styles.stateContainer}>
                  <Ionicons name="alert-circle-outline" size={40} color="#E53935" />
                  <Text style={styles.stateText}>{error}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={fetchSlots}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!isLoading && !error && allSlots.length === 0 && (
                <View style={styles.stateContainer}>
                  <Ionicons name="calendar-outline" size={40} color="#CCC" />
                  <Text style={styles.stateText}>No available slots for this service right now</Text>
                </View>
              )}

              {!isLoading && !error && allSlots.length > 0 && (
                <>
                  <Dropdown
                    label="Pick a date"
                    value={selectedDate}
                    options={dateOptions}
                    onSelect={handleSelectDate}
                  />

                  <Dropdown
                    label="Pick a time"
                    value={selectedTime}
                    options={timeOptions}
                    onSelect={setSelectedTime}
                  />

                  {selectedDate !== '' && timeOptions.length === 0 && (
                    <Text style={styles.noTimesText}>No available times for this date</Text>
                  )}

                  <Text style={styles.commentsLabel}>Additional Comments</Text>
                  <TextInput
                    style={styles.commentsInput}
                    multiline
                    numberOfLines={4}
                    value={comments}
                    onChangeText={setComments}
                    placeholder=""
                    textAlignVertical="top"
                  />
                </>
              )}
            </View>

            <TouchableOpacity
              style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
              onPress={handleContinue}
              disabled={!canContinue}
            >
              <Text style={styles.continueButtonText}>CONTINUE</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 260,
    backgroundColor: '#1B2A56',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2A3F7A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 16,
    color: '#FFF',
    lineHeight: 22,
  },
  logoTextBold: {
    fontWeight: '700',
  },
  logoTextAccent: {
    fontWeight: '700',
    color: '#F2A93B',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B2A56',
  },
  mainContent: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 40,
  },
  scrollContentMobile: {
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 6,
  },
  stepText: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 24,
    opacity: 0.9,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 24,
    marginBottom: 32,
    maxWidth: 640,
  },
  noTimesText: {
    fontSize: 13,
    color: '#E53935',
    marginTop: -8,
    marginBottom: 12,
  },
  commentsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 8,
  },
  commentsInput: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
    padding: 12,
    minHeight: 110,
    fontSize: 14,
    color: '#333',
  },
  stateContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  stateText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#4A90D9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#3D4B6E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    maxWidth: 640,
    alignSelf: 'center',
    width: '100%',
  },
  continueButtonDisabled: {
    backgroundColor: '#B0B7C3',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});