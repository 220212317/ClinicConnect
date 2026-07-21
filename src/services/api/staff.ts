// src/services/api/staff.ts
import { supabase } from '../supabase/client';

export interface StaffMember {
  staffRegNumber: string;
  clinicId: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  role: string;
  specialization?: string;
  licenseNumber?: string;
  department?: string;
  responseUnit?: string;
  ambulanceNumber?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export const staffApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('firstName', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('staffRegNumber', id)
      .single();
    if (error) throw error;
    return data;
  },

  create: async (data: Omit<StaffMember, 'staffRegNumber' | 'createdAt' | 'updatedAt'>) => {
    const { data: result, error } = await supabase
      .from('staff')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  update: async (id: string, data: Partial<StaffMember>) => {
    const { data: result, error } = await supabase
      .from('staff')
      .update({ ...data, updatedAt: new Date().toISOString() })
      .eq('staffRegNumber', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('staff')
      .update({ status: 'inactive', updatedAt: new Date().toISOString() })
      .eq('staffRegNumber', id);
    if (error) throw error;
    return { message: 'Staff member deactivated' };
  },

  toggleStatus: async (id: string) => {
    const { data: staff, error: fetchError } = await supabase
      .from('staff')
      .select('status')
      .eq('staffRegNumber', id)
      .single();
    if (fetchError) throw fetchError;

    const newStatus = staff.status === 'active' ? 'inactive' : 'active';
    const { data, error } = await supabase
      .from('staff')
      .update({ status: newStatus, updatedAt: new Date().toISOString() })
      .eq('staffRegNumber', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

export default staffApi;