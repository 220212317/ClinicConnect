// src/screens/appointments/SelectClinicScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { clinicApi, Clinic } from '../../services/api/clinic';
import { getBestLocation, calculateDistance, CAPE_TOWN_COORDINATES } from '../../utils/location';
import { useAuth } from '../../context/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ClinicWithDistance extends Clinic {
  distanceKm?: number;
}

export default function SelectClinicScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { width } = useWindowDimensions();
  const { profile, staffProfile } = useAuth();

  const [clinics, setClinics] = useState<ClinicWithDistance[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 1024;

  // Derive user initials for the sidebar avatar (patient or staff, whichever is logged in)
  const getInitials = () => {
    const first = profile?.first_name || staffProfile?.first_name || '';
    const last = profile?.last_name || staffProfile?.last_name || '';
    if (!first && !last) return '?';
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  const fetchClinics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await clinicApi.getAll();

      if (!data || data.length === 0) {
        setClinics([]);
        setIsLoading(false);
        return;
      }

      let clinicsWithDistance: ClinicWithDistance[] = data;
      try {
        const location = await getBestLocation();
        clinicsWithDistance = data.map((clinic) => {
          if (clinic.latitude && clinic.longitude) {
            const distanceKm = calculateDistance(
              location.latitude,
              location.longitude,
              clinic.latitude,
              clinic.longitude
            );
            return { ...clinic, distanceKm };
          }
          return clinic;
        });
        clinicsWithDistance.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
      } catch (locErr) {
        console.log('Location unavailable, showing clinics without distance:', locErr);
      }

      setClinics(clinicsWithDistance);
    } catch (err: any) {
      console.error('Failed to fetch clinics:', err);
      setError('Unable to load clinics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  const filteredClinics = clinics.filter((clinic) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      clinic.clinic_name.toLowerCase().includes(q) ||
      (clinic.address || '').toLowerCase().includes(q) ||
      (clinic.location || '').toLowerCase().includes(q)
    );
  });

  const handleSelectClinic = (clinicId: string) => {
    navigation.navigate('SelectService' as any, { clinicId });
  };

  return (
    <View style={styles.root}>
      {/* Sidebar - visible on desktop/web, hidden on narrow mobile widths */}
      {(isDesktop || !isWeb) && (
        <View style={[styles.sidebar, !isDesktop && styles.sidebarMobile]}>
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

      {/* Main content */}
      <LinearGradient
        colors={['#B08968', '#FFFFFF', '#FFFFFF']}
        locations={[0, 0.35, 0.6]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.mainContent}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.title}>Book an appointment</Text>
            <Text style={styles.stepText}>Step 1 of 4 - Clinic</Text>

            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search clinics by name or area..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <Text style={styles.sectionLabel}>SELECT CLINIC</Text>

            <View style={styles.listCard}>
              {isLoading && (
                <View style={styles.stateContainer}>
                  <ActivityIndicator size="large" color="#4A90D9" />
                  <Text style={styles.stateText}>Loading clinics...</Text>
                </View>
              )}

              {!isLoading && error && (
                <View style={styles.stateContainer}>
                  <Ionicons name="alert-circle-outline" size={40} color="#E53935" />
                  <Text style={styles.stateText}>{error}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={fetchClinics}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!isLoading && !error && filteredClinics.length === 0 && (
                <View style={styles.stateContainer}>
                  <Ionicons name="business-outline" size={40} color="#CCC" />
                  <Text style={styles.stateText}>
                    {searchQuery ? 'No clinics match your search' : 'No clinics available right now'}
                  </Text>
                </View>
              )}

              {!isLoading && !error && filteredClinics.map((clinic, index) => (
                <TouchableOpacity
                  key={clinic.id}
                  style={[
                    styles.clinicRow,
                    index === filteredClinics.length - 1 && styles.clinicRowLast,
                  ]}
                  onPress={() => handleSelectClinic(clinic.id)}
                >
                  <Text style={styles.clinicName}>{clinic.clinic_name}</Text>
                  <View style={styles.clinicMetaRow}>
                    {clinic.operating_hours && (
                      <Text style={styles.clinicHours}>{clinic.operating_hours}</Text>
                    )}
                    {clinic.distanceKm != null && (
                      <Text style={styles.clinicDistance}>
                        {clinic.distanceKm < 1
                          ? `${Math.round(clinic.distanceKm * 1000)} m`
                          : `${clinic.distanceKm.toFixed(1)} km`}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
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
  sidebarMobile: {
    display: 'none',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 28,
    maxWidth: 460,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  listCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 24,
  },
  clinicRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  clinicRowLast: {
    borderBottomWidth: 0,
  },
  clinicName: {
    fontSize: 16,
    color: '#3F7FD9',
    textDecorationLine: 'underline',
    marginBottom: 4,
  },
  clinicMetaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  clinicHours: {
    fontSize: 13,
    color: '#444',
  },
  clinicDistance: {
    fontSize: 13,
    color: '#888',
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
});