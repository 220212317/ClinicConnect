// src/services/api/timeslots.ts
import { supabase } from '../supabase/client';

export interface TimeSlot {
  id: string;
  clinicId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
  clinicName?: string;
  serviceName?: string;
}

export const timeSlotApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('timeSlots')
      .select(`
        *,
        clinics:clinicId (clinicName),
        services:serviceId (serviceName)
      `)
      .order('date', { ascending: true })
      .order('startTime', { ascending: true });
    if (error) throw error;
    return data?.map(slot => ({
      ...slot,
      clinicName: slot.clinics?.clinicName || '',
      serviceName: slot.services?.serviceName || '',
    })) || [];
  },

  getByClinic: async (clinicId: string) => {
    const { data, error } = await supabase
      .from('timeSlots')
      .select(`
        *,
        services:serviceId (serviceName)
      `)
      .eq('clinicId', clinicId)
      .order('date', { ascending: true })
      .order('startTime', { ascending: true });
    if (error) throw error;
    return data?.map(slot => ({
      ...slot,
      serviceName: slot.services?.serviceName || '',
    })) || [];
  },

  getByService: async (serviceId: string) => {
    const { data, error } = await supabase
      .from('timeSlots')
      .select('*')
      .eq('serviceId', serviceId)
      .eq('isAvailable', true)
      .order('date', { ascending: true })
      .order('startTime', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  create: async (data: Omit<TimeSlot, 'id' | 'createdAt' | 'updatedAt' | 'clinicName' | 'serviceName'>) => {
    const { data: result, error } = await supabase
      .from('timeSlots')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  update: async (id: string, data: Partial<TimeSlot>) => {
    const { data: result, error } = await supabase
      .from('timeSlots')
      .update({ ...data, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('timeSlots')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Time slot deleted' };
  },

  toggleAvailability: async (id: string) => {
    const { data: slot, error: fetchError } = await supabase
      .from('timeSlots')
      .select('isAvailable')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('timeSlots')
      .update({ 
        isAvailable: !slot.isAvailable, 
        updatedAt: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

export default timeSlotApi;