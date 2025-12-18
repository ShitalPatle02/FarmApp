import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList, ImageBackground, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

const { width } = Dimensions.get('window');

const WeatherScreen = () => {
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState([]);

  const fetchWeather = async () => {
    if (!location.trim()) {
      Alert.alert('Error', 'Please enter a valid location.');
      return;
    }

    try {
      const apiKey = 'b1802b5931225a2a600cedba20993147';
      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${location.trim()}&units=metric&appid=${apiKey}`;

      const response = await axios.get(url);

      if (!response.data.list || response.data.list.length === 0) {
        Alert.alert('Error', 'No weather data available for this location.');
        return;
      }

      // Get today's date in YYYY-MM-DD format adjusted to local time zone
      const today = new Date();
      const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];

      // Filter today's weather data
      const todayWeatherData = response.data.list.filter(item =>
        item.dt_txt.startsWith(localDate)
      );

      if (todayWeatherData.length === 0) {
        Alert.alert('Info', 'No weather data available for today.');
      } else {
        setWeatherData(todayWeatherData);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          Alert.alert('Error', 'Invalid API key. Please check your API key.');
        } else if (error.response.status === 404) {
          Alert.alert('Error', 'Location not found. Please enter a valid location.');
        } else {
          Alert.alert('Error', `Error: ${error.response.status}. Please try again.`);
        }
      } else {
        Alert.alert('Error', 'Unable to connect. Check your internet connection.');
      }
    }
  };

  const renderWeatherCard = ({ item }) => {
    return (
      <View style={styles.card}>
        <Image
          source={{ uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png` }}
          style={styles.weatherIcon}
        />
        <Text style={styles.cardText}>{new Date(item.dt_txt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        <Text style={styles.cardText}>{item.main.temp}°C</Text>
        <Text style={styles.cardSubText}>{item.weather[0].description}</Text>
      </View>
    );
  };

  return (
    <ImageBackground 
    source={require('../assets/Farm9.jpg')}
    style={styles.backgroundImage}
    >
      <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent']} style={styles.overlay}>
        <Text style={styles.title}>Weather Forecast</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter location"
          placeholderTextColor="#aaa"
          value={location}
          onChangeText={setLocation}
        />
        <TouchableOpacity style={styles.button} onPress={fetchWeather}>
          <Text style={styles.buttonText}>Get Weather</Text>
        </TouchableOpacity>
      </LinearGradient>
      <FlatList
        data={weatherData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderWeatherCard}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={<Text style={styles.emptyMessage}>No weather data available. Enter a location to fetch data.</Text>}
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  grid: {
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    alignItems: 'center',
    padding: 15,
    elevation: 5,
  },
  weatherIcon: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardSubText: {
    fontSize: 14,
    color: '#555',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 16,
    color: '#aaa',
    marginTop: 20,
  },
});

export default WeatherScreen;
