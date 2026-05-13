import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  PatientHome: undefined;
  Notifications: undefined;
  BookAppointment: undefined;
  MedicalRecord: undefined;
  NearbyClinics: undefined;
  PatientProfile: undefined;
  Emergency: undefined;
  HealthTips: undefined;
  Alerts: undefined;
  AppointmentDetail: { appointment: Appointment };
};

type NavigationProps = NavigationProp<RootStackParamList>;

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'booked' | 'completed';
}

export default function PatientHomeScreen() {
  const navigation = useNavigation<NavigationProps>();
  const { width } = useWindowDimensions();
  const [unreadMessages] = useState(0);
  const [alertCount] = useState(5);
  const [upcomingAppointments] = useState<Appointment[]>([]);

  const userName = 'Athi';
  const userInitials = 'AS';

  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 1024;
  const isTablet = isWeb && width >= 768 && width < 1024;
  const contentMaxWidth = isDesktop ? 1200 : isTablet ? 768 : '100%';
  const actionColumns = isDesktop ? 4 : isTablet ? 2 : 1;

  const handleEmergencyPress = () => navigation.navigate('Emergency');
  const handleNotificationsPress = () => navigation.navigate('Notifications');

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'nearby':
        navigation.navigate('NearbyClinics');
        break;
      case 'book':
        navigation.navigate('BookAppointment');
        break;
      case 'healthtips':
        navigation.navigate('HealthTips');
        break;
      case 'alerts':
        navigation.navigate('Alerts');
        break;
    }
  };

  const quickActions = [
    { id: 'nearby', label: 'Nearby Clinics', icon: 'business-outline', color: '#1a1a1a' },
    { id: 'book', label: 'Make a Booking', icon: 'add-circle-outline', color: '#1a1a1a' },
    { id: 'healthtips', label: 'Health Tips', icon: 'heart', color: '#c0392b' },
    { id: 'alerts', label: 'Alerts', icon: 'information-circle-outline', color: '#1a1a1a', badge: alertCount },
  ];

  return (
    <LinearGradient
      colors={['#B08968', '#FFFFFF', '#FFFFFF']}
      locations={[0, 0.25, 0.5]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isDesktop && styles.scrollContentDesktop
          ]}
        >
          <View style={[
            styles.contentContainer,
            { maxWidth: contentMaxWidth }
          ]}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={[styles.greeting, isDesktop && styles.greetingDesktop]}>
                  Hello, {userName}
                </Text>
                <Text style={[styles.appName, isDesktop && styles.appNameDesktop]}>
                  ClinicConnect
                </Text>
              </View>
              <TouchableOpacity style={styles.avatarCircle} onPress={handleNotificationsPress}>
                <Text style={styles.avatarText}>{userInitials}</Text>
              </TouchableOpacity>
            </View>

            {/* Stats Row */}
            <View style={[styles.statsRow, isDesktop && styles.statsRowDesktop]}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Upcoming</Text>
                <Text style={styles.statValue}>{upcomingAppointments.length}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Unread messages</Text>
                <Text style={styles.statValue}>{unreadMessages}</Text>
              </View>
            </View>

            {/* Upcoming Appointments */}
            <View style={styles.section}>
              <Text style={styles.sectionTitleUppercase}>UPCOMING APPOINTMENTS</Text>
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appt) => (
                  <TouchableOpacity
                    key={appt.id}
                    style={styles.appointmentCard}
                    onPress={() => navigation.navigate('AppointmentDetail', { appointment: appt })}
                  >
                    <View style={styles.appointmentHeader}>
                      <Text style={styles.appointmentTitle}>{appt.title}</Text>
                      <View style={styles.bookedBadge}>
                        <Text style={styles.bookedBadgeText}>
                          {appt.status === 'booked' ? 'Booked' : 'Upcoming'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.appointmentRow}>
                      <Ionicons name="calendar-outline" size={14} color="#888" />
                      <Text style={styles.appointmentDetail}>
                        {appt.date} · {appt.time}
                      </Text>
                    </View>
                    <View style={styles.appointmentRow}>
                      <Ionicons name="location-outline" size={14} color="#888" />
                      <Text style={styles.appointmentDetail}>{appt.location}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyAppointments}>
                  <Text style={styles.emptyText}>No upcoming appointments</Text>
                </View>
              )}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitleCenter}>Quick Actions</Text>
              <View style={[
                styles.actionsGrid,
                isDesktop && styles.actionsGridDesktop,
                isTablet && styles.actionsGridTablet
              ]}>
                {quickActions.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={[
                      styles.actionCard,
                      isDesktop && styles.actionCardDesktop,
                      isTablet && styles.actionCardTablet
                    ]}
                    onPress={() => handleQuickAction(action.id)}
                  >
                    {action.badge && action.badge > 0 && (
                      <View style={styles.alertBadge}>
                        <Text style={styles.alertBadgeText}>{action.badge}</Text>
                      </View>
                    )}
                    <Text style={styles.actionLabel}>{action.label}</Text>
                    <View style={styles.actionIconWrapper}>
                      <Ionicons name={action.icon as any} size={36} color={action.color} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Emergency Button */}
            <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyPress}>
              <Ionicons name="warning-outline" size={20} color="#fff" />
              <Text style={styles.emergencyText}>Emergency</Text>
            </TouchableOpacity>

            <View style={{ height: isDesktop ? 32 : 16 }} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const SAGE = '#6B7C5C';

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollContentDesktop: {
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: 'transparent',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  greetingDesktop: {
    fontSize: 28,
  },
  appName: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  appNameDesktop: {
    fontSize: 16,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D5CBC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4a3a32',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    marginBottom: 14,
  },
  statsRowDesktop: {
    gap: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: SAGE,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#c8d6bc',
    fontWeight: '500',
    marginBottom: 6,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 14,
    borderRadius: 14,
    padding: 16,
  },
  sectionTitleUppercase: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  sectionTitleCenter: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyAppointments: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#aaa',
  },
  appointmentCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  appointmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  bookedBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  bookedBadgeText: {
    fontSize: 11,
    color: '#2196F3',
    fontWeight: '600',
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  appointmentDetail: {
    fontSize: 12,
    color: '#777',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionsGridDesktop: {
    gap: 16,
  },
  actionsGridTablet: {
    gap: 12,
  },
  actionCard: {
    width: '47%',
    backgroundColor: SAGE,
    borderRadius: 10,
    paddingTop: 10,
    paddingBottom: 14,
    paddingHorizontal: 12,
    alignItems: 'flex-start',
    position: 'relative',
    minHeight: 120,
  },
  actionCardDesktop: {
    width: '23%',
  },
  actionCardTablet: {
    width: '30%',
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#e8f0e0',
    marginBottom: 8,
  },
  actionIconWrapper: {
    alignSelf: 'center',
    marginTop: 4,
  },
  alertBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#E53935',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  alertBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E53935',
    marginHorizontal: 60,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  emergencyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});