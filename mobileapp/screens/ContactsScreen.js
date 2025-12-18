import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ImageBackground,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'https://your-ngrok-url.ngrok.io'; // Replace with your backend's IP and port

const ContactsScreen = () => {
  const [contactsList, setContactsList] = useState([]);
  const [contactName, setContactName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  // Fetch contacts from the backend
  const fetchContacts = async () => {
    try {
      const token = await AsyncStorage.getItem('token'); // Retrieve the token from storage
      if (!token) {
        Alert.alert('Error', 'User is not authenticated. Please log in again.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(`${API_BASE_URL}/contacts`, { headers });
      setContactsList(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to fetch contacts data');
    }
  };

  // Add a new contact
  const addContact = async () => {
    if (!contactName || !phoneNumber) {
      Alert.alert('Error', 'Please provide a name and phone number');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token'); // Retrieve the token from storage
      if (!token) {
        Alert.alert('Error', 'User is not authenticated. Please log in again.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.post(
        `${API_BASE_URL}/contacts`,
        {
          name: contactName,
          phone_number: phoneNumber,
          email,
        },
        { headers }
      );
      Alert.alert('Success', response.data.message);
      fetchContacts();
      setContactName('');
      setPhoneNumber('');
      setEmail('');
    } catch (error) {
      console.error('Error adding contact:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to add contact');
    }
  };

  // Delete a contact
  const deleteContact = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token'); // Retrieve the token from storage
      if (!token) {
        Alert.alert('Error', 'User is not authenticated. Please log in again.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.delete(`${API_BASE_URL}/contacts/${id}`, { headers });
      Alert.alert('Success', response.data.message);
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to delete contact');
    }
  };

  // Search contacts by name or phone number
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query === '') {
      fetchContacts();
    } else {
      const filtered = contactsList.filter((contact) =>
        contact.name.toLowerCase().includes(query.toLowerCase()) ||
        contact.phone_number.includes(query)
      );
      setContactsList(filtered);
    }
  };

  // Render a single contact card
  const renderContactCard = ({ item }) => (
    <View style={styles.card}>
      <Ionicons name="person-circle" size={60} color="#fff" style={styles.cardIcon} />
      <Text style={styles.cardText}>{item.name}</Text>
      <Text style={styles.cardSubText}>Phone: {item.phone_number}</Text>
      {item.email && <Text style={styles.cardSubText}>Email: {item.email}</Text>}
      <TouchableOpacity style={styles.deleteButton} onPress={() => deleteContact(item.id)}>
        <Ionicons name="trash" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageBackground
    source={require('../assets/Farm6.jpg')}
    style={styles.backgroundImage}
    >
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.overlay}>
            <Text style={styles.title}>Contacts Management</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Contacts"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            <TextInput
              style={styles.input}
              placeholder="Contact Name"
              value={contactName}
              onChangeText={setContactName}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phoneNumber}
              keyboardType="phone-pad"
              onChangeText={setPhoneNumber}
            />
            <TextInput
              style={styles.input}
              placeholder="Email (Optional)"
              value={email}
              keyboardType="email-address"
              onChangeText={setEmail}
            />
            <TouchableOpacity style={styles.button} onPress={addContact}>
              <Text style={styles.buttonText}>Add Contact</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <FlatList
          data={contactsList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderContactCard}
          contentContainerStyle={styles.grid}
        />
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  searchInput: {
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  input: {
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  grid: {
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    margin: 12,
    backgroundColor: '#1E88E5',
    borderRadius: 15,
    overflow: 'hidden',
    alignItems: 'center',
    padding: 20,
    elevation: 6,
    position: 'relative',
  },
  cardIcon: {
    marginBottom: 15,
  },
  cardText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  cardSubText: {
    fontSize: 16,
    color: '#fff',
  },
  deleteButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    padding: 6,
    borderRadius: 50,
  },
});

export default ContactsScreen;