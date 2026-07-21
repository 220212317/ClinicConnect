import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { STAFF_ROLES } from '../types';
import LoginScreen from '../screens/auth/LoginScreen';
import StaffLoginScreen from '../screens/auth/StaffLoginScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import RegisterStep1Screen from '../screens/auth/RegisterStep1Screen';
import RegisterStep2Screen from '../screens/auth/RegisterStep2Screen';
import PatientHomeScreen from '../screens/patient/PatientHomeScreen';
import NearbyClinicsScreen from '../screens/patient/NearbyClinicsScreen';
import MedicalRecordScreen from '../screens/medical/MedicalRecordScreen';
import DoctorHomeScreen from '../screens/staff/DoctorHomeScreen';
import NurseHomeScreen from '../screens/staff/NurseHomeScreen';

const Stack = createStackNavigator();

const LoadingScreen = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <ActivityIndicator size="large" color="#2E7D32" />
  </View>
);

export default function AppNavigator() {
  const { isLoading, isLoggedIn, userRole } = useAuth();

  if (isLoading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Loading" component={LoadingScreen} />
      </Stack.Navigator>
    );
  }

  const getInitialRouteName = (): string => {
    if (!isLoggedIn) return 'Login';
    if (!userRole) return 'RoleSelection';
    if (userRole === 'patient') return 'PatientHome';
    return STAFF_ROLES[userRole]?.homeScreen ?? 'RoleSelection';
  };

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Login"
    >
      
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="StaffLogin" component={StaffLoginScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="RegisterStep1" component={RegisterStep1Screen} />
      <Stack.Screen name="RegisterStep2" component={RegisterStep2Screen} />
      <Stack.Screen name="PatientHome" component={PatientHomeScreen} />
      <Stack.Screen name="NearbyClinics" component={NearbyClinicsScreen} />
      <Stack.Screen name="MedicalRecord" component={MedicalRecordScreen} />
      <Stack.Screen name="DoctorHome" component={DoctorHomeScreen} />
      <Stack.Screen name="NurseHome" component={NurseHomeScreen} />
     

    </Stack.Navigator>
  );
}

