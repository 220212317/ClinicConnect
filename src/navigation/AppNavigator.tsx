import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import RegisterStep1Screen from '../screens/auth/RegisterStep1Screen';
import RegisterStep2Screen from '../screens/auth/RegisterStep2Screen';
import PatientHomeScreen from '../screens/patient/PatientHomeScreen';
import NearbyClinicsScreen from '../screens/patient/NearbyClinicsScreen';
import MedicalRecordScreen from '../screens/medical/MedicalRecordScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="RegisterStep1" component={RegisterStep1Screen} />
      <Stack.Screen name="RegisterStep2" component={RegisterStep2Screen} />
      <Stack.Screen name="PatientHome" component={PatientHomeScreen} />
      <Stack.Screen name="NearbyClinics" component={NearbyClinicsScreen} />
      <Stack.Screen name="MedicalRecord" component={MedicalRecordScreen} />
    </Stack.Navigator>
  );
}

