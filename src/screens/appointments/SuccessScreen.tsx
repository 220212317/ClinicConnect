import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from "react-native";

// SuccessScreen Component — Successfully Booked
// This screen is shown after a patient successfully books an appointment.


interface SuccessScreenProps {
  
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({
  message = "SUCCESSFULLY BOOKED",
}) => {
  return (
   
    <SafeAreaView style={styles.safeArea}>

      
      <View style={styles.header}>
        <Text style={styles.headerText}>{message}</Text>
      </View>

      
      <View style={styles.body}>

       
        <Text style={styles.thumbsUp}>👍</Text>

      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

  
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

 
  header: {
    backgroundColor: "#d4b896",  
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
    justifyContent: "flex-end",  
  },


  headerText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1e2a3a",            
    letterSpacing: 0.5,
  },

  
  body: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",   
    alignItems: "center",        
  },

  
  thumbsUp: {
    fontSize: 120,              
  },
});

export default SuccessScreen;