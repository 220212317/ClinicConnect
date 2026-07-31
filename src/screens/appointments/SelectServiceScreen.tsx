// src/screens/appointments/SelectServiceScreen.tsx
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { clinicApi, ClinicService } from '../../services/api/clinic';
import { useAuth } from '../../context/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SelectServiceRouteProp = RouteProp<RootStackParamList, 'SelectService'>;

export default function SelectServiceScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SelectServiceRouteProp>();
  const { clinicId } = route.params;
  const { width } = useWindowDimensions();
  const { profile, staffProfile } = useAuth();

  const [services, setServices] = useState<ClinicService[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 1024;

  const getInitials = () => {
    const first = profile?.first_name || staffProfile?.first_name || '';
    const last = profile?.last_name || staffProfile?.last_name || '';
    if (!first && !last) return '?';
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await clinicApi.getServices(clinicId);
      setServices(data as ClinicService[]);
    } catch (err: any) {
      console.error('Failed to fetch services:', err);
      setError('Unable to load services. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const activeServices = services.filter((s) => s.status === 'active');

  const filteredServices = activeServices.filter((service) => {
    if (!searchQuery) return true;
    return service.service_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSelectService = (serviceId: string) => {
    navigation.navigate('SelectTimeSlot' as any, { clinicId, serviceId });
  };

  const handleCancel = () => {
    // Assumption: Cancel exits the whole booking flow, not just this step.
    navigation.navigate('NearbyClinics');
  };

  return (
    <View style={styles.root}>
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

      <LinearGradient
        colors={['#B08968', '#FFFFFF', '#FFFFFF']}
        locations={[0, 0.35, 0.6]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.mainContent}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.title}>Book an appointment</Text>
            <Text style={styles.stepText}>Step 2 of 4 - Service</Text>

            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search service by name..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <Text style={styles.sectionLabel}>SELECT SERVICE</Text>

            <View style={styles.listCard}>
              {isLoading && (
                <View style={styles.stateContainer}>
                  <ActivityIndicator size="large" color="#4A90D9" />
                  <Text style={styles.stateText}>Loading services...</Text>
                </View>
              )}

              {!isLoading && error && (
                <View style={styles.stateContainer}>
                  <Ionicons name="alert-circle-outline" size={40} color="#E53935" />
                  <Text style={styles.stateText}>{error}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={fetchServices}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!isLoading && !error && filteredServices.length === 0 && (
                <View style={styles.stateContainer}>
                  <Ionicons name="medkit-outline" size={40} color="#CCC" />
                  <Text style={styles.stateText}>
                    {searchQuery
                      ? 'No services match your search'
                      : 'This clinic has no services listed yet'}
                  </Text>
                </View>
              )}

              {!isLoading && !error && filteredServices.map((service, index) => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceRow,
                    index === filteredServices.length - 1 && styles.serviceRowLast,
                  ]}
                  onPress={() => handleSelectService(service.id)}
                >
                  <View style={styles.serviceNameRow}>
                    <View style={styles.bullet} />
                    <Text style={styles.serviceName}>{service.service_name}</Text>
                  </View>
                  {(service.description || service.estimated_duration || service.price != null) && (
                    <View style={styles.serviceMetaRow}>
                      {service.description && (
                        <Text style={styles.serviceMeta} numberOfLines={1}>
                          {service.description}
                        </Text>
                      )}
                      {service.estimated_duration && (
                        <Text style={styles.serviceMeta}>{service.estimated_duration}</Text>
                      )}
                      {service.price != null && (
                        <Text style={styles.serviceMeta}>R{service.price}</Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>CANCEL</Text>
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
    marginBottom: 32,
  },
  serviceRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  serviceRowLast: {
    borderBottomWidth: 0,
  },
  serviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8FA6C9',
  },
  serviceName: {
    fontSize: 16,
    color: '#3F7FD9',
  },
  serviceMetaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    marginLeft: 16,
  },
  serviceMeta: {
    fontSize: 12,
    color: '#888',
    flexShrink: 1,
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
  cancelButton: {
    backgroundColor: '#3D4B6E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    maxWidth: 640,
    alignSelf: 'center',
    width: '100%',
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});