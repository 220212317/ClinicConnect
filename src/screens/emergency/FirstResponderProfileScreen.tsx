import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';

type NavigationProp = StackNavigationProp<RootStackParamList>;

// ── Mock Data ─────────────────────────────────────────────────────────────────
const staffDetails = {
  staffId: 'ER-17225',
  firstName: 'Athenkosi',
  middleName: '',
  lastName: 'Radebe',
  contact: '+27 65 355 6654',
  role: 'Paramedic',
  regDate: '12 Feb 2021',
  status: 'On duty' as 'On duty' | 'Off duty',
};

// ── Component ─────────────────────────────────────────────────────────────────
const FirstResponderProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
   const { logout } = useAuth();

  const handleSignOut = () => {
  Alert.alert(
    'Sign Out',
    'Are you sure you want to sign out?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error('❌ Error signing out:', error);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          }
        },
      },
    ]
  );
};

  const initials = `${staffDetails.firstName[0]}${staffDetails.lastName[0]}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F7F6" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency responders</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Profile Card Top ── */}
        <View style={styles.profileTop}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <Text style={styles.profileName}>
            ER {staffDetails.firstName[0]}. {staffDetails.lastName.toUpperCase()}
          </Text>
          <Text style={styles.profileSub}>Staff ID: {staffDetails.staffId}</Text>

          <View style={styles.dutyBadge}>
            <View style={styles.dutyDot} />
            <Text style={styles.dutyText}>{staffDetails.status}</Text>
          </View>
        </View>

        {/* ── Staff Details ── */}
        <Text style={styles.sectionTitle}>STAFF DETAILS</Text>
        <View style={styles.detailsCard}>
          <DetailRow label="First name" value={staffDetails.firstName} />
          <DetailRow label="Middle name" value={staffDetails.middleName || '—'} />
          <DetailRow label="Last name" value={staffDetails.lastName} />
          <DetailRow label="Contact" value={staffDetails.contact} />
          <DetailRow label="Role" value={staffDetails.role} />
          <DetailRow label="Reg. date" value={staffDetails.regDate} last />
        </View>

        {/* ── Sign Out Button ── */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutText}>SIGN OUT</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Reusable row ──────────────────────────────────────────────────────────────
const DetailRow: React.FC<{ label: string; value: string; last?: boolean }> = ({
  label,
  value,
  last,
}) => (
  <View style={[styles.detailRow, last && { borderBottomWidth: 0 }]}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileTop: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#D9CBB0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  profileSub: {
    fontSize: 13,
    color: '#888888',
    marginTop: 2,
    marginBottom: 10,
  },
  dutyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  dutyDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2E7D32',
    marginRight: 6,
  },
  dutyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2D3A2B',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#888888',
  },
  detailValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#2D3A5C',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  signOutText: {
    color: '#E74C3C',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});

export default FirstResponderProfileScreen;