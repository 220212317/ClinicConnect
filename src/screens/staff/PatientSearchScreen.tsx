import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase/client';

interface PatientResult {
  id: string;
  first_name: string;
  last_name: string;
  contact_number: string | null;
  date_of_birth: string | null;
  gender: string | null;
  id_number: string | null;
}

const DEBOUNCE_MS = 400;

export default function PatientSearchScreen() {
  const navigation = useNavigation();
  const { role } = useAuth();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PatientResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchPatients = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const lower = searchTerm.toLowerCase().trim();
      const stripped = lower.replace(/\s/g, '');

      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, contact_number, date_of_birth, gender, id_number')
        .or(`first_name.ilike.${lower}%,last_name.ilike.${lower}%,contact_number.ilike.${stripped}%,id_number.ilike.${lower}%`)
        .limit(20);

      if (error) throw error;

      setResults(data || []);
    } catch (err) {
      console.error('Error searching patients:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTextChange = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!text.trim()) {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(() => {
      searchPatients(text);
    }, DEBOUNCE_MS);
  }, [searchPatients]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setIsLoading(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const handlePatientPress = (patientId: string) => {
    navigation.navigate('PatientDetailView', { patientId } as never);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (role !== 'Doctor' && role !== 'Nurse') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <Ionicons name="lock-closed-outline" size={48} color="#CCC" />
          <Text style={styles.stateTitle}>Access Restricted</Text>
          <Text style={styles.stateText}>Only doctors and nurses can search patients</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Patients</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, surname, phone or patient ID..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={handleTextChange}
          returnKeyType="search"
          autoCapitalize="words"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Ionicons name="close-circle" size={18} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      <ScrollView contentContainerStyle={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#5B7FC4" />
            <Text style={styles.stateText}>Searching...</Text>
          </View>
        ) : !hasSearched ? (
          <View style={styles.centerState}>
            <Ionicons name="people-outline" size={48} color="#CCC" />
            <Text style={styles.stateTitle}>Find a Patient</Text>
            <Text style={styles.stateText}>Type a name, surname, phone or patient ID</Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.centerState}>
            <Ionicons name="search-outline" size={48} color="#CCC" />
            <Text style={styles.stateTitle}>No Results</Text>
            <Text style={styles.stateText}>
              {/^\d+$/.test(query.trim())
                ? `Patient ID "${query.trim()}" not found`
                : `No patients found for "${query}"`}
            </Text>
          </View>
        ) : (
          results.map((patient) => (
            <TouchableOpacity
              key={patient.id}
              style={styles.resultCard}
              onPress={() => handlePatientPress(patient.id)}
              activeOpacity={0.7}
            >
              <View style={styles.resultAvatar}>
                <Text style={styles.resultAvatarText}>
                  {patient.first_name[0]}{patient.last_name[0]}
                </Text>
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{patient.first_name} {patient.last_name}</Text>
                <Text style={styles.resultSub}>
                  {[patient.gender, formatDate(patient.date_of_birth)].filter(Boolean).join(' \u2022 ')}
                </Text>
                {patient.contact_number && (
                  <Text style={styles.resultContact}>{patient.contact_number}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CCC" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
    padding: 0,
  },
  resultsContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  centerState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 8,
  },
  stateText: {
    fontSize: 14,
    color: '#888',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  resultAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E2D4E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultAvatarText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  resultSub: {
    fontSize: 12,
    color: '#888',
    marginBottom: 1,
  },
  resultContact: {
    fontSize: 12,
    color: '#888',
  },
});
