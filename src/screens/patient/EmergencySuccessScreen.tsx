import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const EmergencySuccessScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#B08968', '#F4F7F6']} style={styles.gradient}>
        <Text style={styles.headerTitle}>Emergency</Text>

        <View style={styles.content}>
          <Text style={styles.successTitle}>Emergency alert reported successfully!</Text>
          <Text style={styles.successSub}>Your emergency will be attended shortly</Text>
          <Text style={styles.successSub}>You will be contacted!</Text>

          <View style={styles.smileyCircle}>
            <Ionicons name="happy-outline" size={72} color="#2E7D32" />
          </View>

          <Text style={styles.caption}>
            Please stay put as our dedicated team evaluates your case
          </Text>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate('PatientHome', {})}
          activeOpacity={0.85}
        >
          <Text style={styles.continueText}>Continue to app</Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  gradient: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 10,
  },
  successSub: {
    fontSize: 13,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 2,
  },
  smileyCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 28,
  },
  caption: {
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  continueButton: {
    backgroundColor: '#2D3A5C',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
});

export default EmergencySuccessScreen;