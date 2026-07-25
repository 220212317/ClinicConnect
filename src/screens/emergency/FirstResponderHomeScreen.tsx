import React, { useState } from 'react';
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
import MapView, { Marker } from 'react-native-maps';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ActiveAlert {
  alertId: string;
  patientId: string;
  triggeredMinsAgo: number;
  location: string;
  coordinates: string;
  time: string;
  status: 'Pending' | 'Dispatched';
  lat: number;
  lng: number;
}

interface ResolvedAlert {
  alertId: string;
  patientId: string;
  area: string;
  date: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const activeAlert: ActiveAlert = {
  alertId: 'A-0042',
  patientId: 'P-0042',
  triggeredMinsAgo: 5,
  location: 'Langa, Cape Town',
  coordinates: '-33.93°S, 18.52°E',
  time: '14:22:05 today',
  status: 'Pending',
  lat: -33.9321,
  lng: 18.5248,
};

const resolvedAlerts: ResolvedAlert[] = [
  { alertId: 'A-0039', patientId: 'P-0030', area: 'Khayelitsha', date: '7 May' },
  { alertId: 'A-0037', patientId: 'P-0018', area: 'Mitchells Plain', date: '28 April' },
];

// ── Component ─────────────────────────────────────────────────────────────────
const FirstResponderHomeScreen: React.FC = () => {
  const [dispatched, setDispatched] = useState(false);

  const handleDispatch = () => {
    Alert.alert(
      'Confirm Dispatch',
      `Dispatch responder to Alert #${activeAlert.alertId} at ${activeAlert.location}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dispatch',
          style: 'destructive',
          onPress: () => setDispatched(true),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={styles.header.backgroundColor} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Responder dashboard</Text>
          <Text style={styles.headerSub}>A. Radebe · On call</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>AR</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Active</Text>
            <Text style={[styles.statValue, { color: '#D32F2F' }]}>
              {dispatched ? 0 : 1}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Dispatched</Text>
            <Text style={[styles.statValue, { color: '#E65100' }]}>
              {dispatched ? 3 : 2}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Resolved</Text>
            <Text style={[styles.statValue, { color: '#2E7D32' }]}>14</Text>
          </View>
        </View>

        {/* ── Active Alerts ── */}
        <Text style={styles.sectionTitle}>ACTIVE ALERTS</Text>

        {!dispatched ? (
          <View style={styles.alertCard}>
            {/* Alert header row */}
            <View style={styles.alertTopRow}>
              <Text style={styles.alertId}>Alert #{activeAlert.alertId}</Text>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>
                  {activeAlert.status}
                </Text>
              </View>
            </View>

            {/* Alert details */}
            <Text style={styles.alertTriggered}>
              Patient {activeAlert.patientId} · triggered {activeAlert.triggeredMinsAgo} min ago
            </Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{activeAlert.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Coordinates</Text>
              <Text style={styles.detailValue}>{activeAlert.coordinates}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{activeAlert.time}</Text>
            </View>

            {/* Map */}
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: activeAlert.lat,
                  longitude: activeAlert.lng,
                  latitudeDelta: 0.03,
                  longitudeDelta: 0.03,
                }}
              >
                <Marker
                  coordinate={{ latitude: activeAlert.lat, longitude: activeAlert.lng }}
                  title={`Alert #${activeAlert.alertId}`}
                  description={activeAlert.location}
                  pinColor="#8B1A1A"
                />
              </MapView>
            </View>

            {/* Dispatch button */}
            <TouchableOpacity style={styles.dispatchButton} onPress={handleDispatch}>
              <Text style={styles.dispatchButtonText}>Dispatch responder</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noAlertCard}>
            <Text style={styles.noAlertText}>No active alerts at the moment.</Text>
          </View>
        )}

        {/* ── Recently Resolved ── */}
        <Text style={styles.sectionTitle}>RECENTLY RESOLVED</Text>

        {resolvedAlerts.map((item) => (
          <View key={item.alertId} style={styles.resolvedCard}>
            <View style={styles.resolvedLeft}>
              <View style={styles.resolvedDot} />
              <View>
                <Text style={styles.resolvedId}>
                  Alert #{item.alertId} · {item.patientId}
                </Text>
                <Text style={styles.resolvedSub}>
                  {item.area} · {item.date}
                </Text>
              </View>
            </View>
            <View style={styles.resolvedBadge}>
              <Text style={styles.resolvedBadgeText}>Resolved</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7F6',
  },

  // Header
  header: {
    backgroundColor: '#7B1D1D',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 13,
    color: '#FFCCCC',
    marginTop: 2,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF22',
    borderWidth: 1.5,
    borderColor: '#FFFFFF55',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },

  // Container
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#707070',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  // Section title
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2D3A2B',
    letterSpacing: 0.6,
    marginBottom: 12,
  },

  // Active alert card
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  alertTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  pendingBadge: {
    backgroundColor: '#FFECE8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#FFCCBB',
  },
  pendingText: {
    color: '#C0392B',
    fontSize: 11,
    fontWeight: '700',
  },
  alertTriggered: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: '#888888',
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '500',
    flex: 1.5,
    textAlign: 'right',
  },

  // Map
  mapContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 14,
    marginBottom: 14,
    height: 160,
  },
  map: {
    flex: 1,
  },

  // Dispatch button
  dispatchButton: {
    backgroundColor: '#7B1D1D',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dispatchButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },

  // No active alert
  noAlertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  noAlertText: {
    color: '#888888',
    fontSize: 14,
  },

  // Resolved alerts
  resolvedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  resolvedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  resolvedDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#2E7D32',
  },
  resolvedId: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  resolvedSub: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  resolvedBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  resolvedBadgeText: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default FirstResponderHomeScreen;