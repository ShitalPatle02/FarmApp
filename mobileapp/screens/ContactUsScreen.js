import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ContactUsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact Us</Text>
      <Text style={styles.text}>For any inquiries, reach out to us at:</Text>
      <Text style={styles.text}>Email: supportfarmapp@gmail.com</Text>
      <Text style={styles.text}>Phone: +91 8805565655</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  text: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});

export default ContactUsScreen;
