import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Picker, ScrollView 
} from 'react-native';
import axios from 'axios';

const BASE_URL = 'https://your-ngrok-url.ngrok.io'; // Replace with your Flask backend URL

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');

  const register = async () => {
    // Check for empty fields
    if (!username || !password || !confirmPassword || !securityQuestion || !securityAnswer) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/register`, {
        username,
        password,
        security_question: securityQuestion,
        security_answer: securityAnswer,
      });

      Alert.alert('Success', response.data.message);
      if (response.data.message === 'Registration successful') {
        navigation.navigate('Login');
      }
    } catch (error) {
      if (error.response?.status === 409) {
        Alert.alert('Error', 'Username already exists. Please choose another one.');
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Registration failed');
      }
    }
  };

  return (
    
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create an Account</Text>

      <TextInput 
        style={styles.input} 
        placeholder="Username" 
        value={username} 
        onChangeText={setUsername} 
      />

      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        secureTextEntry 
        value={password} 
        onChangeText={setPassword} 
      />

      <TextInput 
        style={styles.input} 
        placeholder="Confirm Password" 
        secureTextEntry 
        value={confirmPassword} 
        onChangeText={setConfirmPassword} 
      />

      <Picker
        selectedValue={securityQuestion}
        onValueChange={setSecurityQuestion}
        style={styles.picker}
      >
        <Picker.Item label="Select a security question" value="" />
        <Picker.Item label="What is your pet’s name?" value="pet" />
        <Picker.Item label="What is your mother’s maiden name?" value="maiden_name" />
        <Picker.Item label="What was your first school?" value="school" />
      </Picker>

      <TextInput 
        style={styles.input} 
        placeholder="Answer" 
        value={securityAnswer} 
        onChangeText={setSecurityAnswer} 
      />

      <TouchableOpacity style={styles.button} onPress={register}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  picker: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    color: '#4CAF50',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default RegisterScreen;
