// SeedsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ImageBackground,
  Dimensions,
  Linking,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'https://your-ngrok-url.ngrok.io'; // Replace with your backend's IP and port

const SeedsScreen = () => {
  const [seedsList, setSeedsList] = useState([]);
  const [seedName, setSeedName] = useState('');
  const [price, setPrice] = useState('');
  const [quality, setQuality] = useState('');
  const [vendor, setVendor] = useState('');
  const [vendorUrl, setVendorUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSeeds();
  }, []);

  // Fetch seeds from the backend
  const fetchSeeds = async () => {
    try {
      const token = await AsyncStorage.getItem('token'); // Retrieve the token from storage
      if (!token) {
        Alert.alert('Error', 'User is not authenticated. Please log in again.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(`${API_BASE_URL}/seeds`, { headers });
      setSeedsList(response.data);
    } catch (error) {
      console.error('Error fetching seeds:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to fetch seeds data');
    }
  };

  // Add a new seed
  const addSeed = async () => {
    if (!seedName || !price || !quality || !vendor) {
      Alert.alert('Error', 'Please fill in all fields');
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
        `${API_BASE_URL}/seeds`,
        {
          name: seedName,
          price: parseFloat(price),
          quality,
          vendor,
          vendor_url: vendorUrl,
        },
        { headers }
      );
      Alert.alert('Success', response.data.message || 'Seed added successfully');
      fetchSeeds();
      setSeedName('');
      setPrice('');
      setQuality('');
      setVendor('');
      setVendorUrl('');
    } catch (error) {
      console.error('Error adding seed:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to add seed');
    }
  };

  // Delete a seed
  const deleteSeed = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token'); // Retrieve the token from storage
      if (!token) {
        Alert.alert('Error', 'User is not authenticated. Please log in again.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.delete(`${API_BASE_URL}/seeds/${id}`, { headers });
      Alert.alert('Success', response.data.message || 'Seed deleted successfully');
      fetchSeeds();
    } catch (error) {
      console.error('Error deleting seed:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to delete seed');
    }
  };

  // Search seeds by name or vendor
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query === '') {
      fetchSeeds();
    } else {
      const filtered = seedsList.filter((seed) =>
        seed.name.toLowerCase().includes(query.toLowerCase()) ||
        seed.vendor.toLowerCase().includes(query.toLowerCase())
      );
      setSeedsList(filtered);
    }
  };

  // Open vendor link
  const openVendorLink = (vendorUrl) => {
    if (!vendorUrl) {
      Alert.alert('Error', 'Vendor URL is not available');
      return;
    }
    Linking.openURL(vendorUrl).catch(() => {
      Alert.alert('Error', 'Failed to open the link');
    });
  };

  // Open seed information link
  const openSeedInfo = () => {
    Linking.openURL('https://agribegri.com/buy-cheap-agricultural-seeds-online-in-india.php').catch(() => {
      Alert.alert('Error', 'Failed to open the seed information website');
    });
  };

  // Render a single seed card
  const renderSeedCard = ({ item }) => (
    <View style={styles.card}>
      <Ionicons name="leaf" size={50} color="#4CAF50" style={styles.cardIcon} />
      <View style={styles.cardContent}>
        <Text style={styles.cardText}>{item.name}</Text>
        <Text style={styles.cardSubText}>Price: ₹{item.price}</Text>
        <Text style={styles.cardSubText}>Quality: {item.quality}</Text>
        <Text style={styles.cardSubText}>Vendor: {item.vendor}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteSeed(item.id)}>
          <Ionicons name="trash" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ImageBackground
    source={require('../assets/Farm8.jpg')}
     style={styles.backgroundImage}
    >
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.overlay}>
            <Text style={styles.title}>Seeds Management</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Seeds"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            <TextInput
              style={styles.input}
              placeholder="Seed Name"
              value={seedName}
              onChangeText={setSeedName}
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              value={price}
              keyboardType="numeric"
              onChangeText={setPrice}
            />
            <TextInput
              style={styles.input}
              placeholder="Quality"
              value={quality}
              onChangeText={setQuality}
            />
            <TextInput
              style={styles.input}
              placeholder="Vendor"
              value={vendor}
              onChangeText={setVendor}
            />
            
            <TouchableOpacity style={styles.addButton} onPress={addSeed}>
              <Text style={styles.addButtonText}>Add Seed</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.infoButton} onPress={openSeedInfo}>
              <Text style={styles.infoButtonText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <FlatList
          data={seedsList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSeedCard}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyMessage}>No seeds found. Add some!</Text>}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  searchInput: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    elevation: 4,
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    elevation: 4,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoButton: {
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
  listContainer: {
    paddingBottom: 20,
    paddingHorizontal: 10, // Add padding to prevent overlapping
  },
  card: {
    flexDirection: 'column', // Stack content vertically
    alignItems: 'flex-start', // Align items to the start
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
    position: 'relative',
  },
  cardContent: {
    flex: 1,
    marginBottom: 10, // Add spacing between content and actions
  },
  cardIcon: {
    marginBottom: 10, // Add spacing below the icon
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5, // Add spacing between text
  },
  cardSubText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5, // Add spacing between subtext
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Space out the buttons
    width: '100%', // Ensure buttons take full width
  },
  linkButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginRight: 10,
  },
  linkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FF4500',
    padding: 8,
    borderRadius: 50,
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
    marginTop: 20,
  },
});

export default SeedsScreen;
