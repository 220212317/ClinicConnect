// src/screens/patient/PatientProfileScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Switch,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { PatientProfile } from '../../services/api/profile';

// Local interface for display purposes (matches PatientProfile)
interface ProfileDisplay {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  contact_number: string | null;
  id_number: string | null;
  gender: string | null;
  ethnicity: string | null;
  address: {
    streetNumber?: string;
    streetName?: string;
    city?: string;
    postalCode?: string;
    province?: string;
  } | null;
  next_of_kin_name: string | null;
  next_of_kin_relation: string | null;
  next_of_kin_contact: string | null;
  notification_preference: {
    sms: boolean;
    email: boolean;
    inApp: boolean;
  };
}

export default function PatientProfileScreen() {
  const navigation = useNavigation();
  const { user, profile: authProfile, logout, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<ProfileDisplay | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check if authProfile exists and has the required properties
      if (authProfile && typeof authProfile === 'object' && 'id' in authProfile) {
        // Map PatientProfile to ProfileDisplay
        const displayProfile: ProfileDisplay = {
          id: (authProfile as any).id || '',
          first_name: (authProfile as any).first_name || '',
          last_name: (authProfile as any).last_name || '',
          email: (authProfile as any).email || null,
          contact_number: (authProfile as any).contact_number || null,
          id_number: (authProfile as any).id_number || null,
          gender: (authProfile as any).gender || null,
          ethnicity: (authProfile as any).ethnicity || null,
          address: (authProfile as any).address || null,
          next_of_kin_name: (authProfile as any).next_of_kin_name || null,
          next_of_kin_relation: (authProfile as any).next_of_kin_relation || null,
          next_of_kin_contact: (authProfile as any).next_of_kin_contact || null,
          notification_preference: (authProfile as any).notification_preference || {
            sms: false,
            email: false,
            inApp: false,
          },
        };
        setProfile(displayProfile);
        setIsLoading(false);
        setRefreshing(false);
        return;
      }

      if (user?.id) {
        await refreshProfile();
        // After refresh, check again
        if (authProfile && typeof authProfile === 'object' && 'id' in authProfile) {
          const displayProfile: ProfileDisplay = {
            id: (authProfile as any).id || '',
            first_name: (authProfile as any).first_name || '',
            last_name: (authProfile as any).last_name || '',
            email: (authProfile as any).email || null,
            contact_number: (authProfile as any).contact_number || null,
            id_number: (authProfile as any).id_number || null,
            gender: (authProfile as any).gender || null,
            ethnicity: (authProfile as any).ethnicity || null,
            address: (authProfile as any).address || null,
            next_of_kin_name: (authProfile as any).next_of_kin_name || null,
            next_of_kin_relation: (authProfile as any).next_of_kin_relation || null,
            next_of_kin_contact: (authProfile as any).next_of_kin_contact || null,
            notification_preference: (authProfile as any).notification_preference || {
              sms: false,
              email: false,
              inApp: false,
            },
          };
          setProfile(displayProfile);
        } else {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setProfile(null);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user, authProfile, refreshProfile]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.navigate('Login' as never);
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const handleViewRecords = () => {
    navigation.navigate('MedicalRecord' as never);
  };

  const handleCompleteRegistration = () => {
    navigation.navigate('RegisterStep1' as never);
  };

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber && phoneNumber !== 'Not specified' && phoneNumber !== 'N/A') {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleEmail = (email: string) => {
    if (email && email !== 'Not specified' && email !== 'N/A') {
      Linking.openURL(`mailto:${email}`);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B7C5C" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show "Complete Registration" screen if no profile exists
  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#B08968', '#FFFFFF', '#FFFFFF']}
          locations={[0, 0.15, 0.5]}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.noProfileContainer}>
            <View style={styles.noProfileIconContainer}>
              <Ionicons name="person-outline" size={64} color="#CCC" />
            </View>
            <Text style={styles.noProfileTitle}>Profile Not Found</Text>
            <Text style={styles.noProfileText}>
              Please complete your registration to set up your profile.
            </Text>
            <TouchableOpacity style={styles.completeRegistrationButton} onPress={handleCompleteRegistration}>
              <Text style={styles.completeRegistrationButtonText}>Complete Registration</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#E53935" />
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const fullName = `${profile.first_name} ${profile.last_name}`.trim() || 'User';
  const initials = profile.first_name && profile.last_name
    ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    : 'U';
  const patientId = profile.id ? profile.id.substring(0, 8).toUpperCase() : 'N/A';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      <LinearGradient
        colors={['#B08968', '#FFFFFF', '#FFFFFF']}
        locations={[0, 0.15, 0.5]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6B7C5C']} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Profile Header - Name and Avatar */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{fullName}</Text>
              <Text style={styles.profileId}>Patient ID: {patientId}</Text>
            </View>
          </View>

          {/* Personal Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PERSONAL DETAILS</Text>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Email</Text>
              <TouchableOpacity onPress={() => handleEmail(profile.email || '')}>
                <Text style={[styles.detailValue, styles.linkText]}>
                  {profile.email || 'Not specified'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Contact</Text>
              <TouchableOpacity onPress={() => handleCall(profile.contact_number || '')}>
                <Text style={[styles.detailValue, styles.linkText]}>
                  {profile.contact_number || 'Not specified'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Gender</Text>
              <Text style={styles.detailValue}>{profile.gender || 'Not specified'}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Ethnicity</Text>
              <Text style={styles.detailValue}>{profile.ethnicity || 'Not specified'}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Address</Text>
              <Text style={styles.detailValue}>
                {profile.address
                  ? `${profile.address.streetNumber || ''} ${profile.address.streetName || ''}, ${profile.address.city || ''}, ${profile.address.province || ''}`
                    .trim() || 'Not specified'
                  : 'Not specified'}
              </Text>
            </View>
          </View>

          {/* Next of Kin Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>NEXT OF KIN</Text>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Name</Text>
              <Text style={styles.detailValue}>{profile.next_of_kin_name || 'Not specified'}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Relationship</Text>
              <Text style={styles.detailValue}>{profile.next_of_kin_relation || 'Not specified'}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Contacts</Text>
              <TouchableOpacity onPress={() => handleCall(profile.next_of_kin_contact || '')}>
                <Text style={[styles.detailValue, styles.linkText]}>
                  {profile.next_of_kin_contact || 'Not specified'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notification Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>NOTIFICATIONS PREFERENCES</Text>

            <View style={styles.switchItem}>
              <Text style={styles.switchLabel}>SMS notifications</Text>
              <Switch
                value={profile.notification_preference?.sms || false}
                onValueChange={() => {}}
                trackColor={{ false: '#E0E0E0', true: '#6B7C5C' }}
              />
            </View>

            <View style={styles.switchItem}>
              <Text style={styles.switchLabel}>Email notifications</Text>
              <Switch
                value={profile.notification_preference?.email || false}
                onValueChange={() => {}}
                trackColor={{ false: '#E0E0E0', true: '#6B7C5C' }}
              />
            </View>

            <View style={styles.switchItem}>
              <Text style={styles.switchLabel}>In-App notifications</Text>
              <Switch
                value={profile.notification_preference?.inApp || false}
                onValueChange={() => {}}
                trackColor={{ false: '#E0E0E0', true: '#6B7C5C' }}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleViewRecords}>
              <Ionicons name="medical-outline" size={20} color="#6B7C5C" />
              <Text style={styles.actionButtonText}>RECORDS</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#E53935" />
              <Text style={[styles.actionButtonText, styles.signOutText]}>SIGN OUT</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
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
    color: '#1a1a1a',
  },
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
    backgroundColor: '#D5CBC4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4a3a32',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  profileId: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
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
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  linkText: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  switchLabel: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  signOutText: {
    color: '#E53935',
  },
  // No Profile State
  noProfileContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 40,
  },
  noProfileIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  noProfileTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  noProfileText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  completeRegistrationButton: {
    backgroundColor: '#6B7C5C',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  completeRegistrationButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 12,
    gap: 8,
  },
  signOutButtonText: {
    fontSize: 16,
    color: '#E53935',
    fontWeight: '500',
  },
});