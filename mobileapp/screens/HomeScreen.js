// HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, ScrollView, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {  
  const services = [
    { name: 'Attendance', icon: 'people', route: 'AttendanceScreen' },
    { name: 'Fertilizer', icon: 'medkit', route: 'MedicinesScreen' },
    { name: 'Seeds', icon: 'leaf', route: 'SeedsScreen' },
    { name: 'Expenses', icon: 'cash', route: 'ExpensesScreen' },
    { name: 'Weather', icon: 'cloud', route: 'WeatherScreen' },
    { name: 'Calendar', icon: 'calendar', route: 'CalendarScreen' },
    { name: 'Contacts', icon: 'call', route: 'ContactsScreen' },
  ];

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // Call the logout API
        const response = await fetch('http://<backend-url>/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          await AsyncStorage.removeItem('token'); // Clear the token
          navigation.navigate('Login'); // Navigate back to the login screen
        } else {
          const data = await response.json();
          Alert.alert('Error', data.message || 'Failed to logout');
        }
      }
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'An error occurred during logout');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/Farm4.jpg')}
      style={styles.backgroundImage}
    >
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.3)', 'transparent']}
        style={styles.gradient}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome to Farmer App</Text>
          <Text style={styles.subtitle}>Your farming assistant in one place</Text>
        </View>
        <ScrollView contentContainerStyle={styles.servicesContainer}>
          {services.map((service, index) => (
            <TouchableOpacity
              key={index}
              style={styles.serviceCard}
              onPress={() => navigation.navigate(service.route)}
            >
              <LinearGradient
                colors={['#4CAF50', '#087f23']}
                style={styles.cardGradient}
              >
                <Ionicons name={service.icon} size={50} color="#fff" style={styles.serviceIcon} />
                <Text style={styles.serviceText}>{service.name}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  gradient: {
    flex: 1,
  },
  headerContainer: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  serviceCard: {
    width: width * 0.42,
    marginVertical: 10,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
  },
  cardGradient: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  serviceIcon: {
    marginBottom: 10,
  },
  serviceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#FF4500',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default HomeScreen;
