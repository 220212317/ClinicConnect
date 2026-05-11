import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity, 
  StatusBar 
} from 'react-native';

const MedicalRecordScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Navigation Header */}
        <TouchableOpacity style={styles.backButton} onPress={() => console.log('Back pressed')}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Medical Record</Text>
          <Text style={styles.patientId}>Patient ID: A1234Z</Text>
        </View>

        {/* Visit Summary Section */}
        <Text style={styles.sectionTitle}>VISIT SUMMARY</Text>
        <View style={styles.summaryCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Appointment</Text>
            <Text style={styles.value}>General Consultation{"\n"}07 April 2026</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Clinic</Text>
            <Text style={[styles.value, styles.linkText]}>Adriaanse Clinic</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Completed</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.notesLabel}>Diagnostic notes:</Text>
          <Text style={styles.notesText}>
            Mild upper respiratory infection. Prescribed 5-day course of antibiotics. 
            Patient advised to rest and increase fluid intake.
          </Text>
        </View>

        {/* Allergies Section */}
        <Text style={styles.sectionTitle}>ALLERGIES</Text>
        <View style={styles.pillContainer}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Penicillin</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Aspirin</Text>
          </View>
        </View>

        {/* Medication Section */}
        <Text style={styles.sectionTitle}>MEDICATION</Text>
        <View style={styles.pillContainer}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Metformin 500mg</Text>
          </View>
        </View>

        {/* Last Visit Section */}
        <Text style={styles.sectionTitle}>LAST VISIT</Text>
        <Text style={styles.lastVisitDate}>07 April 2026</Text>

        {/* Action Button */}
        <TouchableOpacity style={styles.downloadButton}>
          <Text style={styles.downloadButtonText}>Download PDF</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7F6', 
  },
  container: {
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  backButton: {
    marginTop: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#2D3A2B',
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#202020',
  },
  patientId: {
    fontSize: 14,
    color: '#707070',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2D3A2B', 
    marginTop: 25,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    // Shadow for Android
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#555555',
    flex: 1,
  },
  value: {
    fontSize: 13,
    color: '#2D3A2B',
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  statusBadge: {
    backgroundColor: '#A8C6A3',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 3,
  },
  statusText: {
    color: '#2D3A2B',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 15,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#444',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    backgroundColor: '#769471', 
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  lastVisitDate: {
    fontSize: 15,
    color: '#2D3A2B',
    fontWeight: '500',
  },
  downloadButton: {
    backgroundColor: '#3F4E65', 
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 45,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MedicalRecordScreen;