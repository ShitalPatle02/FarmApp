import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://your-ngrok-url.ngrok.io'; // Replace with your backend's IP and port

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [events, setEvents] = useState({});
  const [newEvent, setNewEvent] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch events from the backend
  const fetchEvents = async () => {
    try {
      const token = await AsyncStorage.getItem('token'); // Retrieve the token from storage
      if (!token) {
        Alert.alert('Error', 'User is not authenticated. Please log in again.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(`${API_BASE_URL}/calendar`, { headers });
      const eventsData = response.data.reduce((acc, event) => {
        if (!acc[event.date]) {
          acc[event.date] = [];
        }
        acc[event.date].push(event);
        return acc;
      }, {});
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to fetch events');
    }
  };

  // Add a new event
  const addEvent = async () => {
    if (!newEvent.trim()) {
      Alert.alert('Error', 'Please enter an event description');
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
        `${API_BASE_URL}/calendar`,
        {
          date: selectedDate || new Date().toISOString().split('T')[0],
          description: newEvent,
        },
        { headers }
      );
      Alert.alert('Success', response.data.message || 'Event added successfully');
      fetchEvents(); // Refresh events
      setNewEvent('');
    } catch (error) {
      console.error('Error adding event:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to add event');
    }
  };

  // Update an event
  const updateEvent = async (id, updatedDate, updatedDescription) => {
    try {
      const token = await AsyncStorage.getItem('token'); // Retrieve the token from storage
      if (!token) {
        Alert.alert('Error', 'User is not authenticated. Please log in again.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.put(
        `${API_BASE_URL}/calendar`,
        {
          id,
          date: updatedDate,
          description: updatedDescription,
        },
        { headers }
      );
      Alert.alert('Success', response.data.message || 'Event updated successfully');
      fetchEvents(); // Refresh events
    } catch (error) {
      console.error('Error updating event:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to update event');
    }
  };

  // Delete an event
  const deleteEvent = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token'); // Retrieve the token from storage
      if (!token) {
        Alert.alert('Error', 'User is not authenticated. Please log in again.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.delete(`${API_BASE_URL}/calendar`, {
        headers,
        data: { id }, // Pass the correct event ID
      });
      Alert.alert('Success', response.data.message || 'Event deleted successfully');
      fetchEvents(); // Refresh events
    } catch (error) {
      console.error('Error deleting event:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to delete event');
    }
  };

  // Handle date selection
  const onDayPress = (day) => {
    setSelectedDate(day.dateString || new Date().toISOString().split('T')[0]);
  };

  // Generate marked dates for the calendar
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

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={onDayPress}
        markedDates={getMarkedDates()} // Mark dates with events and the selected date
        theme={{
          selectedDayBackgroundColor: '#4CAF50',
          todayTextColor: '#4CAF50',
          arrowColor: '#4CAF50',
        }}
      />
      <Text style={styles.selectedDate}>
        Selected Date: {selectedDate || 'None'}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Enter event description"
        value={newEvent}
        onChangeText={setNewEvent}
      />
      <TouchableOpacity style={styles.addButton} onPress={addEvent}>
        <Text style={styles.addButtonText}>Add Event</Text>
      </TouchableOpacity>
      <FlatList
        data={events[selectedDate] || []}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.eventItem}>
            <Text style={styles.eventText}>{item.description}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteEvent(item.id)} // Pass the correct event ID
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyMessage}>
            No events for this date. Add one!
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  selectedDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  eventText: {
    fontSize: 14,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#FF4500',
    padding: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 14,
    color: '#aaa',
    marginTop: 20,
  },
});

export default CalendarScreen;