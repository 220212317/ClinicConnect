// src/services/api/services.ts
import { supabase } from '../supabase/client';

export interface Service {
  id: string;
  clinicId: string;
  serviceName: string;
  description: string;
  estimatedDuration: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
  clinicName?: string;
}

export const serviceApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        clinics:clinicId (clinicName)
      `)
      .order('serviceName', { ascending: true });
    if (error) throw error;
    return data?.map(service => ({
      ...service,
      clinicName: service.clinics?.clinicName || '',
    })) || [];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        clinics:clinicId (clinicName)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return {
      ...data,
      clinicName: data?.clinics?.clinicName || '',
    };
  },

  getByClinic: async (clinicId: string) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('clinicId', clinicId)
      .eq('status', 'active')
      .order('serviceName', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  create: async (data: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'clinicName'>) => {
    const { data: result, error } = await supabase
      .from('services')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  update: async (id: string, data: Partial<Service>) => {
    const { data: result, error } = await supabase
      .from('services')
      .update({ ...data, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('services')
      .update({ status: 'inactive', updatedAt: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return { message: 'Service deactivated' };
  },

  toggleStatus: async (id: string) => {
    const { data: service, error: fetchError } = await supabase
      .from('services')
      .select('status')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;

    const newStatus = service.status === 'active' ? 'inactive' : 'active';
    const { data, error } = await supabase
      .from('services')
      .update({ status: newStatus, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

export default serviceApi;