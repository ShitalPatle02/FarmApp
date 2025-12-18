// MedicinesScreen.js
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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'https://your-ngrok-url.ngrok.io'; // Replace with your backend's IP and port

const MedicinesScreen = () => {
  const [medicinesList, setMedicinesList] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [medicineName, setMedicineName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [vendor, setVendor] = useState('');
  const [vendorUrl, setVendorUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMedicines();
  }, []);

  // Fetch medicines from the backend
  const fetchMedicines = async () => {
    try {
      const token = await AsyncStorage.getItem('token'); // Retrieve the token from storage
      if (!token) {
        Alert.alert('Error', 'User is not authenticated. Please log in again.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(`${API_BASE_URL}/medicines`, { headers });
      setMedicinesList(response.data); // Update the state with medicines data
      setFilteredMedicines(response.data); // Initialize filtered list
    } catch (error) {
      console.error('Error fetching Fertilizers:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.msg || 'Failed to fetch Fertilizers data');
    }
  };

  // Add a new medicine
  const addMedicine = async () => {
    if (!medicineName || !quantity || !vendor ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isNaN(quantity) || parseInt(quantity, 10) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity greater than zero');
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
        `${API_BASE_URL}/medicines`,
        {
          name: medicineName,
          quantity: parseInt(quantity, 10),
          vendor,
          vendor_url: vendorUrl,
        },
        { headers }
      );
      Alert.alert('Success', response.data.message || 'Fertilizer added successfully');
      fetchMedicines(); // Refresh the medicines list
      setMedicineName('');
      setQuantity('');
      setVendor('');
      setVendorUrl('');
    } catch (error) {
      console.error('Error adding Fertilizer:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.msg || 'Failed to add Fertilizer');
    }
  };

  // Delete a medicine
  const deleteMedicine = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token'); // Retrieve the token from storage
      if (!token) {
        Alert.alert('Error', 'User is not authenticated. Please log in again.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.delete(`${API_BASE_URL}/medicines/${id}`, { headers });
      Alert.alert('Success', response.data.message || 'Fertilizer deleted successfully');
      fetchMedicines(); // Refresh the medicines list
    } catch (error) {
      console.error('Error deleting Fertilizer:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.msg || 'Failed to delete Fertilizer');
    }
  };

  // Open external vendor link
  

  // Search medicines by name
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredMedicines(medicinesList); // Reset to full list if search query is empty
    } else {
      const filtered = medicinesList.filter((medicine) =>
        medicine.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMedicines(filtered);
    }
  };
const openSeedInfo = () => {
    Linking.openURL('https://agribegri.com/buy-cheap-fertilizers-online-in-india.php').catch(() => {
      Alert.alert('Error', 'Failed to open the seed information website');
    });
  };
  // Render a single medicine card
  const renderMedicineCard = ({ item }) => (
    <View style={styles.card}>
      <Ionicons name="medkit" size={60} color="#fff" style={styles.cardIcon} />
      <Text style={styles.cardText}>{item.name}</Text>
      <Text style={styles.cardSubText}>Quantity: {item.quantity || 0}</Text>
      <Text style={styles.cardSubText}>Vendor: {item.vendor}</Text>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteMedicine(item.id)}>
          <Ionicons name="trash" size={20} color="#fff" />
        </TouchableOpacity>
        
      </View>
    </View>
  );

  return (
    <ImageBackground
    source={require('../assets/Farm11.jpg')}
    style={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Fertilizer Management</Text>
        <TextInput
          style={styles.input}
          placeholder="Search Fertilizer"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TextInput
          style={styles.input}
          placeholder="Fertilizer Name"
          value={medicineName}
          onChangeText={setMedicineName}
        />
        <TextInput
          style={styles.input}
          placeholder="Quantity"
          value={quantity}
          keyboardType="numeric"
          onChangeText={setQuantity}
        />
        <TextInput
          style={styles.input}
          placeholder="Vendor"
          value={vendor}
          onChangeText={setVendor}
        />
       
        <TouchableOpacity style={styles.button} onPress={addMedicine}>
          <Text style={styles.buttonText}>Add Fertilizer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.infoButton} onPress={openSeedInfo}>
                      <Text style={styles.infoButtonText}>Buy Now</Text>
       </TouchableOpacity>
      </View>
      <FlatList
        data={filteredMedicines}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMedicineCard}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={<Text style={styles.emptyMessage}>No Fertilizer available. Add some!</Text>}
      />
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 12,
    fontSize: 16,
    elevation: 4,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
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
    backgroundColor: '#4CAF50',
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
  cardActions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    padding: 6,
    borderRadius: 50,
    marginHorizontal: 5,
  },
  buyButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },infoButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
  },
  infoButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
    marginTop: 20,
  },
});

export default MedicinesScreen;
