import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../services/supabase/client';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Dropdown } from '../../components/Dropdown';

interface TimeSlot {
  id: string;
  clinic_id: string;
  clinic_name?: string;
  service_id: string;
  service_name?: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export default function TimeSlotManagementScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [clinics, setClinics] = useState<{ id: string; name: string }[]>([]);
  const [services, setServices] = useState<{ id: string; name: string; clinic_id: string }[]>([]);
  const [filteredServices, setFilteredServices] = useState<{ id: string; name: string; clinic_id: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [form, setForm] = useState({
    clinic_id: '',
    service_id: '',
    date: new Date(),
    start_time: new Date(),
    end_time: new Date(),
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch clinics
      const { data: clinicsData } = await supabase
        .from('clinics')
        .select('id, clinic_name')
        .eq('status', 'active');

      setClinics(clinicsData?.map(c => ({ id: c.id, name: c.clinic_name })) || []);

      // Fetch services
      const { data: servicesData } = await supabase
        .from('services')
        .select('id, service_name, clinic_id')
        .eq('status', 'active');

      const formattedServices = servicesData?.map(s => ({
        id: s.id,
        name: s.service_name,
        clinic_id: s.clinic_id,
      })) || [];

      setServices(formattedServices);
      setFilteredServices(formattedServices);

      // Fetch time slots
      const { data: slotsData, error } = await supabase
        .from('time_slots')
        .select(`
          *,
          clinic:clinic_id (clinic_name),
          service:service_id (service_name)
        `)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      const formattedSlots = slotsData?.map(s => ({
        ...s,
        clinic_name: s.clinic?.clinic_name || 'Unknown Clinic',
        service_name: s.service?.service_name || 'Unknown Service',
      })) || [];

      setTimeSlots(formattedSlots);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      Alert.alert('Error', 'Failed to load time slots');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleClinicChange = (clinicName: string) => {
    const clinic = clinics.find(c => c.name === clinicName);
    if (clinic) {
      setForm({ ...form, clinic_id: clinic.id, service_id: '' });
      const filtered = services.filter(s => s.clinic_id === clinic.id);
      setFilteredServices(filtered);
    }
  };

  const handleEdit = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setForm({
      clinic_id: slot.clinic_id,
      service_id: slot.service_id,
      date: new Date(slot.date),
      start_time: new Date(`2000-01-01T${slot.start_time}`),
      end_time: new Date(`2000-01-01T${slot.end_time}`),
    });
    setFilteredServices(services.filter(s => s.clinic_id === slot.clinic_id));
    setModalVisible(true);
  };

  const handleDelete = (slotId: string) => {
    Alert.alert(
      'Delete Time Slot',
      'Are you sure you want to delete this time slot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('time_slots')
                .delete()
                .eq('id', slotId);
              
              if (error) throw error;
              await fetchData();
              Alert.alert('Success', 'Time slot deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete time slot');
            }
          },
        },
      ]
    );
  };

  const toggleAvailability = async (slot: TimeSlot) => {
    try {
      const { error } = await supabase
        .from('time_slots')
        .update({ is_available: !slot.is_available })
        .eq('id', slot.id);
      
      if (error) throw error;
      await fetchData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update availability');
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.clinic_id) errors.clinic_id = 'Please select a clinic';
    if (!form.service_id) errors.service_id = 'Please select a service';
    if (form.start_time >= form.end_time) {
      errors.end_time = 'End time must be after start time';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const dateStr = form.date.toISOString().split('T')[0];
    const startTimeStr = form.start_time.toTimeString().slice(0, 5);
    const endTimeStr = form.end_time.toTimeString().slice(0, 5);

    const payload = {
      clinic_id: form.clinic_id,
      service_id: form.service_id,
      date: dateStr,
      start_time: startTimeStr,
      end_time: endTimeStr,
      is_available: true,
    };

    try {
      if (editingSlot) {
        const { error } = await supabase
          .from('time_slots')
          .update(payload)
          .eq('id', editingSlot.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('time_slots')
          .insert(payload);
        
        if (error) throw error;
      }
      
      setModalVisible(false);
      setEditingSlot(null);
      setForm({ clinic_id: '', service_id: '', date: new Date(), start_time: new Date(), end_time: new Date() });
      setFilteredServices(services);
      await fetchData();
      Alert.alert('Success', `Time slot ${editingSlot ? 'updated' : 'created'} successfully`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save time slot');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderTimeSlotCard = (slot: TimeSlot) => (
    <View key={slot.id} style={[styles.slotCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.slotHeader}>
        <View style={styles.slotInfo}>
          <Text style={[styles.slotClinic, { color: theme.colors.text }]}>
            {slot.clinic_name}
          </Text>
          <View style={[styles.availabilityBadge, { backgroundColor: slot.is_available ? '#4CAF50' : '#9E9E9E' }]}>
            <Text style={styles.availabilityText}>
              {slot.is_available ? 'Available' : 'Booked'}
            </Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: slot.is_available ? '#FF9800' : '#4CAF50' }]}
            onPress={() => toggleAvailability(slot)}
          >
            <Ionicons name={slot.is_available ? 'lock-open-outline' : 'lock-closed-outline'} size={18} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
            onPress={() => handleEdit(slot)}
          >
            <Ionicons name="create-outline" size={18} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#E53935' }]}
            onPress={() => handleDelete(slot.id)}
          >
            <Ionicons name="trash-outline" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.slotDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
            {formatDate(slot.date)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
            {slot.start_time} - {slot.end_time}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="medkit-outline" size={16} color="#666" />
          <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
            {slot.service_name}
          </Text>
        </View>
      </View>
    </View>
  );

  const clinicOptions = clinics.map(c => c.name);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={['#B08968', '#FFFFFF', '#FFFFFF']}
        locations={[0, 0.15, 0.5]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Time Slot Management</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setEditingSlot(null);
              setForm({ clinic_id: '', service_id: '', date: new Date(), start_time: new Date(), end_time: new Date() });
              setFilteredServices(services);
              setModalVisible(true);
            }}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6B7C5C" />
            <Text style={styles.loadingText}>Loading time slots...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={fetchData} colors={['#6B7C5C']} />
            }
            showsVerticalScrollIndicator={false}
          >
            {timeSlots.length > 0 ? (
              timeSlots.map(renderTimeSlotCard)
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="time-outline" size={64} color="#CCC" />
                <Text style={styles.emptyTitle}>No time slots found</Text>
                <Text style={styles.emptyText}>Create time slots for clinic services</Text>
              </View>
            )}
            <View style={{ height: 20 }} />
          </ScrollView>
        )}

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  {editingSlot ? 'Edit Time Slot' : 'Add Time Slot'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <Dropdown
                label="Clinic"
                value={clinics.find(c => c.id === form.clinic_id)?.name || ''}
                options={clinicOptions}
                onSelect={handleClinicChange}
                error={formErrors.clinic_id}
              />

              <Dropdown
                label="Service"
                value={services.find(s => s.id === form.service_id)?.name || ''}
                options={filteredServices.map(s => s.name)}
                onSelect={(name) => {
                  const service = filteredServices.find(s => s.name === name);
                  if (service) setForm({ ...form, service_id: service.id });
                }}
                error={formErrors.service_id}
              />

              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.datePickerLabel}>Date</Text>
                <Text style={styles.datePickerValue}>
                  {form.date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={form.date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event: any, selectedDate?: Date) => {
                    setShowDatePicker(false);
                    if (selectedDate) setForm({ ...form, date: selectedDate });
                  }}
                />
              )}

              <View style={styles.timeRow}>
                <TouchableOpacity
                  style={[styles.timePickerButton, { flex: 1 }]}
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <Text style={styles.timePickerLabel}>Start Time</Text>
                  <Text style={styles.timePickerValue}>
                    {form.start_time.toTimeString().slice(0, 5)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.timePickerButton, { flex: 1 }]}
                  onPress={() => setShowEndTimePicker(true)}
                >
                  <Text style={styles.timePickerLabel}>End Time</Text>
                  <Text style={styles.timePickerValue}>
                    {form.end_time.toTimeString().slice(0, 5)}
                  </Text>
                </TouchableOpacity>
              </View>

              {showStartTimePicker && (
                <DateTimePicker
                  value={form.start_time}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event: any, selectedTime?: Date) => {
                    setShowStartTimePicker(false);
                    if (selectedTime) setForm({ ...form, start_time: selectedTime });
                  }}
                />
              )}

              {showEndTimePicker && (
                <DateTimePicker
                  value={form.end_time}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event: any, selectedTime?: Date) => {
                    setShowEndTimePicker(false);
                    if (selectedTime) setForm({ ...form, end_time: selectedTime });
                  }}
                />
              )}

              {formErrors.end_time && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {formErrors.end_time}
                </Text>
              )}

              <Button
                title={editingSlot ? 'Update Time Slot' : 'Add Time Slot'}
                onPress={handleSave}
                style={styles.modalButton}
              />
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a1a' },
  addButton: {
    backgroundColor: '#6B7C5C',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666' },
  slotCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  slotInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  slotClinic: { fontSize: 16, fontWeight: '600' },
  availabilityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  availabilityText: { color: '#FFF', fontSize: 10, fontWeight: '600' },
  actionButtons: { flexDirection: 'row', gap: 6 },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotDetails: { gap: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 13 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '600' },
  modalButton: { marginTop: 8 },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  datePickerLabel: { fontSize: 11, color: '#666', marginBottom: 4 },
  datePickerValue: { fontSize: 15, color: '#333' },
  timeRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  timePickerButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
  },
  timePickerLabel: { fontSize: 11, color: '#666', marginBottom: 4 },
  timePickerValue: { fontSize: 15, color: '#333' },
  errorText: { fontSize: 12, marginBottom: 8 },
});