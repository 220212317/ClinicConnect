import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase/client';

const HEADER_BG = '#0F1B35';

export default function NurseProfileScreen() {
  const navigation = useNavigation();
  const { staffProfile, logout, refreshProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editContact, setEditContact] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleStartEdit = () => {
    setEditEmail(staffProfile?.email || '');
    setEditContact(staffProfile?.contact_number || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditEmail('');
    setEditContact('');
  };

  const handleSaveProfile = async () => {
    if (!editEmail.trim()) {
      Alert.alert('Error', 'Email cannot be empty');
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('staff')
        .update({
          email: editEmail.trim(),
          contact_number: editContact.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', staffProfile!.id);

      if (error) throw error;

      await refreshProfile();
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setIsChangingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password changed successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

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
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  if (!staffProfile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Profile not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const fullName = `${staffProfile.first_name} ${staffProfile.last_name}`.trim();
  const initials = `${staffProfile.first_name[0]}${staffProfile.last_name[0]}`.toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      <LinearGradient
        colors={['#0F1B35', '#1E2D4E', '#F5F5F5']}
        locations={[0, 0.15, 0.4]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
              <Text style={styles.headerTitle}>Profile</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{fullName}</Text>
                <Text style={styles.profileRole}>{staffProfile.role}</Text>
              </View>
            </View>

            {/* Professional Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PROFESSIONAL DETAILS</Text>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Staff ID</Text>
                <Text style={styles.detailValue}>{staffProfile.staff_reg_number}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Role</Text>
                <Text style={styles.detailValue}>{staffProfile.role}</Text>
              </View>

              {staffProfile.specialization && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Specialization</Text>
                  <Text style={styles.detailValue}>{staffProfile.specialization}</Text>
                </View>
              )}

              {staffProfile.license_number && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>License No.</Text>
                  <Text style={styles.detailValue}>{staffProfile.license_number}</Text>
                </View>
              )}

              {staffProfile.department && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Department</Text>
                  <Text style={styles.detailValue}>{staffProfile.department}</Text>
                </View>
              )}

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={[styles.detailValue, { color: staffProfile.status === 'active' ? '#4CAF50' : '#E53935' }]}>
                  {staffProfile.status.charAt(0).toUpperCase() + staffProfile.status.slice(1)}
                </Text>
              </View>
            </View>

            {/* Contact Details */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>CONTACT DETAILS</Text>
                {!isEditing && (
                  <TouchableOpacity onPress={handleStartEdit}>
                    <Text style={styles.editBtn}>Edit</Text>
                  </TouchableOpacity>
                )}
              </View>

              {isEditing ? (
                <>
                  <View style={styles.editField}>
                    <Text style={styles.editLabel}>Email</Text>
                    <TextInput
                      style={styles.editInput}
                      value={editEmail}
                      onChangeText={setEditEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  <View style={styles.editField}>
                    <Text style={styles.editLabel}>Contact</Text>
                    <TextInput
                      style={styles.editInput}
                      value={editContact}
                      onChangeText={setEditContact}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View style={styles.editActions}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelEdit}>
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                      onPress={handleSaveProfile}
                      disabled={isSaving}
                    >
                      <Text style={styles.saveBtnText}>{isSaving ? 'Saving...' : 'Save'}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Email</Text>
                    <Text style={styles.detailValue}>{staffProfile.email}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Contact</Text>
                    <Text style={styles.detailValue}>{staffProfile.contact_number || 'Not specified'}</Text>
                  </View>
                </>
              )}
            </View>

            {/* Change Password */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>SECURITY</Text>
                {!isChangingPassword && (
                  <TouchableOpacity onPress={() => setIsChangingPassword(true)}>
                    <Text style={styles.editBtn}>Change Password</Text>
                  </TouchableOpacity>
                )}
              </View>

              {isChangingPassword ? (
                <>
                  <View style={styles.editField}>
                    <Text style={styles.editLabel}>New Password</Text>
                    <TextInput
                      style={styles.editInput}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                      placeholder="Min 8 characters"
                      placeholderTextColor="#bbb"
                    />
                  </View>
                  <View style={styles.editField}>
                    <Text style={styles.editLabel}>Confirm Password</Text>
                    <TextInput
                      style={styles.editInput}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      placeholder="Re-enter new password"
                      placeholderTextColor="#bbb"
                    />
                  </View>
                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => {
                        setIsChangingPassword(false);
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                    >
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                      onPress={handleChangePassword}
                      disabled={isSaving}
                    >
                      <Text style={styles.saveBtnText}>{isSaving ? 'Saving...' : 'Update'}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <Text style={styles.passwordHint}>Keep your account secure with a strong password.</Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="#E53935" />
                <Text style={styles.signOutText}>SIGN OUT</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>
        </KeyboardAvoidingView>
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
  flex: {
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
    fontSize: 14,
    color: '#888',
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
    color: '#fff',
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
  profileRole: {
    fontSize: 14,
    color: '#5B7FC4',
    fontWeight: '500',
    marginTop: 2,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  editBtn: {
    fontSize: 13,
    color: '#5B7FC4',
    fontWeight: '600',
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

  // Edit Fields
  editField: {
    marginBottom: 12,
  },
  editLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  editInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  editActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1E2D4E',
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },

  // Password
  passwordHint: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },

  // Actions
  actionsContainer: {
    marginTop: 8,
  },
  signOutButton: {
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
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E53935',
  },
});
