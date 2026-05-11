import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import MedicalRecordScreen from '../screens/medical/MedicalRecordScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return null; 
  }

  return (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    
    <Stack.Screen name="MedicalRecord" component={MedicalRecordScreen} />
  </Stack.Navigator>
);
}

