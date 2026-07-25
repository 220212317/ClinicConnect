import { supabase } from '../supabase/client';

// ============================================================
// These interfaces mirror the real Postgres column names
// (snake_case), matching src/types/index.ts and the actual
// Supabase schema. Do NOT use camelCase field names here —
// PostgREST will reject them (see the "column does not exist"
// error this fixed).
// ============================================================

export interface Clinic {
  id: string;
  clinic_name: string;
  location: string;
  address: string | null;
  phone: string | null;
  facility_type: 'Clinic' | 'CDC' | 'Satellite' | 'Mobile' | null;
  latitude: number | null;
  longitude: number | null;
  operating_hours: string | null;
  contact_details: string | null;
  website: string | null;
  email: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ClinicService {
  id: string;
  clinic_id: string;
  service_name: string;
  description: string | null;
  estimated_duration: string | null;
  price: number | null;
  status: 'active' | 'inactive';
}

export interface ClinicStaff {
  id: string;
  staff_reg_number: string;
  first_name: string;
  last_name: string;
  role: string;
  contact_number: string | null;
  email: string;
  status: 'active' | 'inactive';
}

export interface ClinicTimeSlot {
  id: string;
  clinic_id: string;
  service_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_patients: number;
  booked_count: number;
}

export interface ClinicDetails extends Clinic {
  services: ClinicService[];
  staff: ClinicStaff[];
  time_slots: ClinicTimeSlot[];
}

export interface ClinicWithDistance extends Clinic {
  distance_km: number;
  distance: string;
}

export interface CreateClinicData {
  clinic_name: string;
  location?: string;
  address?: string;
  phone?: string;
  facility_type?: 'Clinic' | 'CDC' | 'Satellite' | 'Mobile';
  latitude?: number | null;
  longitude?: number | null;
  operating_hours?: string;
  contact_details?: string;
}

export interface UpdateClinicData extends Partial<CreateClinicData> {
  status?: 'active' | 'inactive';
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ClinicSearchFilters {
  query?: string;
  facility_type?: 'Clinic' | 'CDC' | 'Satellite' | 'Mobile' | 'all';
  latitude?: number;
  longitude?: number;
  max_distance?: number;
}

export type FacilityType = 'Clinic' | 'CDC' | 'Satellite' | 'Mobile';

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};

const SERVICE_SELECT = `
  id,
  service_name,
  description,
  estimated_duration
`;

export const clinicApi = {

  // Patient-facing: active clinics only.
  getAll: async (): Promise<Clinic[]> => {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('status', 'active')
      .order('clinic_name');

    if (error) throw error;
    return data || [];
  },

  // Admin-facing: every clinic regardless of status, so a soft-deleted
  // (inactive) clinic stays visible/editable instead of disappearing.
  getAllForAdmin: async (): Promise<Clinic[]> => {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .order('clinic_name');

    if (error) throw error;
    return data || [];
  },

  getAllWithServices: async () => {
    const { data, error } = await supabase
      .from('clinics')
      .select(`*, services:services (${SERVICE_SELECT})`)
      .eq('status', 'active')
      .order('clinic_name');

    if (error) throw error;
    return data || [];
  },

  getByFacilityType: async (facilityType: FacilityType) => {
    const { data, error } = await supabase
      .from('clinics')
      .select(`*, services:services (${SERVICE_SELECT})`)
      .eq('status', 'active')
      .eq('facility_type', facilityType)
      .order('clinic_name');

    if (error) throw error;
    return data || [];
  },

  getClinicsWithinRadius: async (
    coordinates: Coordinates,
    radiusKm: number = 10
  ): Promise<ClinicWithDistance[]> => {
    const { latitude, longitude } = coordinates;

    const { data, error } = await supabase
      .from('clinics')
      .select(`*, services:services (${SERVICE_SELECT})`)
      .eq('status', 'active')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (error) throw error;

    const clinicsWithDistance = (data || []).map((clinic: any) => {
      const distance_km = calculateDistance(latitude, longitude, clinic.latitude, clinic.longitude);
      return {
        ...clinic,
        distance_km,
        distance: formatDistance(distance_km),
      };
    });

    return clinicsWithDistance.filter((c) => c.distance_km <= radiusKm);
  },

  searchClinics: async (filters: ClinicSearchFilters) => {
    let query = supabase
      .from('clinics')
      .select(`*, services:services (${SERVICE_SELECT})`)
      .eq('status', 'active')
      .order('clinic_name');

    if (filters.query) {
      const searchTerm = `%${filters.query}%`;
      query = query.or(`clinic_name.ilike.${searchTerm},address.ilike.${searchTerm},location.ilike.${searchTerm}`);
    }

    if (filters.facility_type && filters.facility_type !== 'all') {
      query = query.eq('facility_type', filters.facility_type);
    }

    const { data, error } = await query;
    if (error) throw error;

    let results: any[] = data || [];

    if (filters.latitude != null && filters.longitude != null) {
      results = results.map((clinic) => {
        let distance_km = Infinity;
        if (clinic.latitude && clinic.longitude) {
          distance_km = calculateDistance(filters.latitude!, filters.longitude!, clinic.latitude, clinic.longitude);
        }
        return {
          ...clinic,
          distance_km,
          distance: distance_km < Infinity ? formatDistance(distance_km) : 'N/A',
        };
      });

      if (filters.max_distance) {
        results = results.filter((c) => c.distance_km <= filters.max_distance!);
      }

      results.sort((a, b) => (a.distance_km || Infinity) - (b.distance_km || Infinity));
    }

    return results;
  },

  getById: async (id: string): Promise<Clinic> => {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  getDetails: async (id: string): Promise<ClinicDetails> => {
    const clinic = await clinicApi.getById(id);

    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .eq('clinic_id', id)
      .eq('status', 'active')
      .order('service_name', { ascending: true });

    if (servicesError) throw servicesError;

    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('clinic_id', id)
      .eq('status', 'active')
      .order('first_name', { ascending: true });

    if (staffError) throw staffError;

    const { data: timeSlots, error: timeSlotsError } = await supabase
      .from('time_slots')
      .select('*')
      .eq('clinic_id', id)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (timeSlotsError) throw timeSlotsError;

    return {
      ...clinic,
      services: services || [],
      staff: staff || [],
      time_slots: timeSlots || [],
    };
  },

  create: async (data: CreateClinicData): Promise<Clinic> => {
    const { data: clinic, error } = await supabase
      .from('clinics')
      .insert({
        clinic_name: data.clinic_name,
        address: data.location || data.address || '',
        location: data.location || data.address || '',
        phone: data.contact_details || data.phone || '',
        contact_details: data.contact_details || data.phone || '',
        facility_type: data.facility_type || 'Clinic',
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        operating_hours: data.operating_hours || '',
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return clinic;
  },

  update: async (id: string, data: UpdateClinicData): Promise<Clinic> => {
    const updateData: any = {};
    if (data.clinic_name !== undefined) updateData.clinic_name = data.clinic_name;
    if (data.location !== undefined) {
      updateData.location = data.location;
      updateData.address = data.location;
    }
    if (data.contact_details !== undefined) {
      updateData.contact_details = data.contact_details;
      updateData.phone = data.contact_details;
    }
    if (data.operating_hours !== undefined) updateData.operating_hours = data.operating_hours;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.facility_type !== undefined) updateData.facility_type = data.facility_type;
    if (data.status !== undefined) updateData.status = data.status;
    updateData.updated_at = new Date().toISOString();

    const { data: clinic, error } = await supabase
      .from('clinics')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return clinic;
  },

  // Soft delete: marks the clinic inactive rather than removing the row,
  // so appointment/medical-record history stays intact. Refuses if the
  // clinic has active (non-cancelled) appointments.
  delete: async (id: string) => {
    const { count, error: appointmentError } = await supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', id)
      .neq('status', 'cancelled');

    if (appointmentError) throw appointmentError;

    if (count && count > 0) {
      throw new Error('Cannot delete clinic with existing appointments');
    }

    const { error } = await supabase
      .from('clinics')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
    return { message: 'Clinic deleted successfully' };
  },

  getServices: async (id: string) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('clinic_id', id)
      .order('service_name');

    if (error) throw error;
    return data || [];
  },

  getStaff: async (id: string) => {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('clinic_id', id)
      .order('first_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  getTimeSlots: async (id: string, date?: string) => {
    let query = supabase
      .from('time_slots')
      .select('*')
      .eq('clinic_id', id)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  getFacilityTypes: async (): Promise<FacilityType[]> => {
    const { data, error } = await supabase
      .from('clinics')
      .select('facility_type')
      .eq('status', 'active')
      .not('facility_type', 'is', null);

    if (error) throw error;

    const types = new Set((data || []).map((c: any) => c.facility_type));
    return Array.from(types) as FacilityType[];
  },

  getStats: async (id: string) => {
    const [appointments, staff, services] = await Promise.all([
      supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('clinic_id', id).eq('status', 'booked'),
      supabase.from('staff').select('id', { count: 'exact', head: true }).eq('clinic_id', id).eq('status', 'active'),
      supabase.from('services').select('id', { count: 'exact', head: true }).eq('clinic_id', id).eq('status', 'active'),
    ]);

    return {
      totalAppointments: appointments.count || 0,
      activeStaff: staff.count || 0,
      activeServices: services.count || 0,
    };
  },

  getNearbyClinics: async (
    coordinates: Coordinates,
    radiusKm: number = 10,
    limit: number = 20,
    offset: number = 0
  ) => {
    const allClinics = await clinicApi.getClinicsWithinRadius(coordinates, radiusKm);
    const paginated = allClinics.slice(offset, offset + limit);

    return {
      clinics: paginated,
      total: allClinics.length,
      hasMore: offset + limit < allClinics.length,
    };
  },
};

export default clinicApi;