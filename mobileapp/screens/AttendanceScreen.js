// AttendanceScreen.js
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
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'https://your-ngrok-url.ngrok.io'; // Replace with your backend's IP and port

const AttendanceScreen = () => {
  const [attendanceList, setAttendanceList] = useState([]);
  const [workerName, setWorkerName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [events, setEvents] = useState({});
  const [newEvent, setNewEvent] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const token = await AsyncStorage.getItem('token'); // Retrieve the token from storage
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(`${API_BASE_URL}/attendance`, { headers });
      setAttendanceList(response.data);
      console.log('Attendance data:', response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to fetch attendance data');
    }
  };

  const addWorker = async () => {
    if (!workerName.trim()) {
      Alert.alert('Error', 'Please enter a worker name');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token'); // Retrieve the token from storage
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.post(
        `${API_BASE_URL}/attendance`,
        { worker_name: workerName },
        { headers }
      );
      Alert.alert('Success', response.data.message);
      fetchAttendance(); // Refresh the attendance list
      setWorkerName(''); // Clear the input field
    } catch (error) {
      console.error('Error adding worker:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.error || 'Failed to add worker');
    }
  };

  const deleteWorker = async (id) => {
    console.log('Deleting worker with ID:', id); // Debug log
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.delete(`${API_BASE_URL}/attendance/${id}`, { headers });
      Alert.alert('Success', 'Worker removed successfully');
      fetchAttendance();
    } catch (error) {
      console.error('Error deleting worker:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.error || 'Failed to delete worker');
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query === '') {
      fetchAttendance();
    } else {
      const filtered = attendanceList.filter(
        (worker) =>
          worker.worker_name &&
          worker.worker_name.toLowerCase().includes(query.toLowerCase())
      );
      setAttendanceList(filtered);
    }
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const addEvent = () => {
    if (!newEvent.trim()) {
      Alert.alert('Error', 'Please enter an event description');
      return;
    }
    setEvents((prevEvents) => ({
      ...prevEvents,
      [selectedDate]: [...(prevEvents[selectedDate] || []), newEvent],
    }));
    setNewEvent('');
  };

  const deleteEvent = (index) => {
    setEvents((prevEvents) => {
      const updatedEvents = [...(prevEvents[selectedDate] || [])];
      updatedEvents.splice(index, 1);
      return { ...prevEvents, [selectedDate]: updatedEvents };
    });
  };

  const getMarkedDates = () => {
    const marked = {};
    Object.keys(events).forEach((date) => {
      marked[date] = { marked: true, dotColor: '#4CAF50' };
    });
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#4CAF50',
      };
    }
    return marked;
  };

  const calculateTotalWorkingDays = (workerName) => {
    const workerAttendance = attendanceList.filter(
      (worker) =>
        worker.worker_name &&
        worker.worker_name.toLowerCase() === workerName.toLowerCase()
    );
    return workerAttendance.length;
  };

  const renderWorkerCard = ({ item }) => (
    <View style={styles.card}>
      <Ionicons name="person-circle" size={50} color="#4CAF50" style={styles.cardIcon} />
      <View style={{ flex: 1 }}>
        <Text style={styles.cardText}>
          {item.worker_name ? item.worker_name : 'Unknown Worker'}
        </Text>
        <Text style={styles.cardSubText}>Date: {item.attendance_date}</Text>
        <Text style={styles.cardSubText}>
          Total Working Days: {calculateTotalWorkingDays(item.worker_name || '')}
        </Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => deleteWorker(item.id)}>
        <Ionicons name="trash" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageBackground
    source={require('../assets/Farm10.jpg')}
     style={styles.backgroundImage}
    >
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <View style={styles.overlay}>
          <Text style={styles.title}>Attendance Management</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Workers"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter Worker Name"
            value={workerName}
            onChangeText={setWorkerName}
          />
          <TouchableOpacity style={styles.addButton} onPress={addWorker}>
            <Text style={styles.addButtonText}>Add Worker</Text>
          </TouchableOpacity>
          <FlatList
            data={attendanceList}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderWorkerCard}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={<Text style={styles.emptyMessage}>No workers found. Add some!</Text>}
          />
        </View>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchInput: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    elevation: 4,
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    elevation: 4,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
  },
  cardIcon: {
    marginRight: 15,
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardSubText: {
    fontSize: 14,
    color: '#555',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    borderRadius: 10,
    padding: 10,
    marginLeft: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
    marginTop: 20,
  },
});

export default AttendanceScreen;
