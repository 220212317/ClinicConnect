import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StaffLoginScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Staff Login - Coming Soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 16, color: '#555' },
});

export default StaffLoginScreen;
