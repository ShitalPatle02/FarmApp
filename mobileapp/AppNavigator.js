import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { LoginScreen, ForgotPasswordScreen } from './screens/LoginScreen'; // Correct import
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import MedicinesScreen from './screens/MedicinesScreen';
import SeedsScreen from './screens/SeedsScreen';
import ExpensesScreen from './screens/ExpensesScreen';
import CalendarScreen from './screens/CalendarScreen';
import ContactsScreen from './screens/ContactsScreen';
import WeatherScreen from './screens/WeatherScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import AboutUsScreen from './screens/AboutUsScreen';
import ContactUsScreen from './screens/ContactUsScreen';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();

// Logout Button Component
const LogoutButton = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token'); // Clear the token
      navigation.replace('Welcome'); // Navigate back to the Login screen
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <Text style={styles.logoutButtonText}>Logout</Text>
    </TouchableOpacity>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerStyle: { backgroundColor: '#4CAF50' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }} // Hide header for Welcome Screen
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Login' }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ title: 'Forgot Password' }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: 'Register' }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: 'Home',
            headerRight: () => <LogoutButton navigation={navigation} />, // Add Logout Button
          })}
        />
        <Stack.Screen
          name="AttendanceScreen"
          component={AttendanceScreen}
          options={{ title: 'Attendance Management' }}
        />
        <Stack.Screen
          name="MedicinesScreen"
          component={MedicinesScreen}
          options={{ title: 'Fertilizers Management' }}
        />
        <Stack.Screen
          name="SeedsScreen"
          component={SeedsScreen}
          options={{ title: 'Seeds Management' }}
        />
        <Stack.Screen
          name="ExpensesScreen"
          component={ExpensesScreen}
          options={{ title: 'Expenses Management' }}
        />
        <Stack.Screen
          name="CalendarScreen"
          component={CalendarScreen}
          options={{ title: 'Calendar & Reminders' }}
        />
        <Stack.Screen
          name="ContactsScreen"
          component={ContactsScreen}
          options={{ title: 'Contacts' }}
        />
        <Stack.Screen
          name="WeatherScreen"
          component={WeatherScreen}
          options={{ title: 'Weather Details' }}
        />
        <Stack.Screen
          name="AboutUs"
          component={AboutUsScreen}
          options={{ title: 'About Us' }}
        />
        <Stack.Screen
          name="ContactUs"
          component={ContactUsScreen}
          options={{ title: 'Contact Us' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Styles for the Logout Button
const styles = StyleSheet.create({
  logoutButton: {
    marginRight: 10,
    padding: 10,
    backgroundColor: '#FF4500',
    borderRadius: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default AppNavigator;
