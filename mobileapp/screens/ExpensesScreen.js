// ExpensesScreen.js
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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { debounce } from 'lodash';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'https://your-ngrok-url.ngrok.io'; // Replace with your backend's IP and port

const ExpensesScreen = () => {
  const [expensesList, setExpensesList] = useState([]);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [settledExpenses, setSettledExpenses] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Fetch expenses from the backend
  const fetchExpenses = async () => {
    try {
      const token = await AsyncStorage.getItem('token'); // Retrieve the token from storage
      if (!token) {
        Alert.alert('Error', 'User is not authenticated. Please log in again.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(`${API_BASE_URL}/expenses`, { headers });
      setExpensesList(response.data);
      calculateTotals(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch expenses data');
    }
  };

  // Calculate total and settled expenses
  const calculateTotals = (expenses) => {
    const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
    const settled = expenses
      .filter((expense) => expense.settled)
      .reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
    setTotalExpenses(total);
    setSettledExpenses(settled);
  };

  // Add a new expense
  const addExpense = async () => {
    if (!expenseTitle || !amount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount greater than zero');
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
        `${API_BASE_URL}/expenses`,
        {
          name: expenseTitle,
          amount: parseFloat(amount),
          date: new Date().toISOString().split('T')[0],
          category,
        },
        { headers }
      );
      Alert.alert('Success', response.data.message || 'Expense added successfully');
      fetchExpenses();
      setExpenseTitle('');
      setAmount('');
      setCategory('');
    } catch (error) {
      console.error('Error adding expense:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add expense');
    }
  };

  // Delete an expense
  const deleteExpense = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token'); // Retrieve the token from storage
      if (!token) {
        Alert.alert('Error', 'User is not authenticated. Please log in again.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Pass the id as part of the URL
      const response = await axios.delete(`${API_BASE_URL}/expenses/${id}`, { headers });
      Alert.alert('Success', response.data.message || 'Expense removed successfully');
      fetchExpenses(); // Refresh the expenses list
    } catch (error) {
      console.error('Error deleting expense:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete expense');
    }
  };

  // Settle an expense
  const settleExpense = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token'); // Retrieve the token from storage
      if (!token) {
        Alert.alert('Error', 'User is not authenticated. Please log in again.');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Send the id in the request body
      const response = await axios.put(
        `${API_BASE_URL}/expenses/settle`,
        { id }, // Payload with the expense ID
        { headers }
      );

      Alert.alert('Success', response.data.message || 'Expense settled successfully');
      fetchExpenses(); // Refresh the expenses list
    } catch (error) {
      console.error('Error settling expense:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to settle expense');
    }
  };

  // Search expenses by title
  const handleSearch = debounce((query) => {
    setSearchQuery(query);
    if (query === '') {
      fetchExpenses(); // Reset to the full list if the search query is empty
    } else {
      const filtered = expensesList.filter((expense) =>
        expense.name.toLowerCase().includes(query.toLowerCase())
      );
      setExpensesList(filtered);
    }
  }, 300); // Debounce with a delay of 300ms

  // Render a single expense card
  const renderExpenseCard = ({ item }) => (
    <View style={[styles.card, item.settled ? styles.settledCard : null]}>
      <Ionicons
        name="cash"
        size={50}
        color={item.settled ? '#FFD700' : '#4CAF50'}
        style={styles.cardIcon}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardText}>{item.name}</Text>
        <Text style={styles.cardSubText}>Amount: ₹{item.amount}</Text>
        <Text style={styles.cardSubText}>Date: {item.date}</Text>
        <Text style={styles.cardSubText}>Category: {item.category}</Text>
      </View>
      <View style={styles.cardActions}>
        {!item.settled && (
          <TouchableOpacity style={styles.settleButton} onPress={() => settleExpense(item.id)}>
            <Text style={styles.settleButtonText}>Settle</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteExpense(item.id)}>
          <Ionicons name="trash" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (

    <ImageBackground
      source={ require('../assets/Farm2.jpg')}
      style={styles.backgroundImage}
    >
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.overlay}>
            <Text style={styles.title}>Expense Management</Text>
            <Text style={styles.totalText}>Total Expenses: ₹{totalExpenses.toFixed(2)}</Text>
            <Text style={styles.settledText}>Settled Expenses: ₹{settledExpenses.toFixed(2)}</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Expenses"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            <TextInput
              style={styles.input}
              placeholder="Expense Title"
              value={expenseTitle}
              onChangeText={setExpenseTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount"
              value={amount}
              keyboardType="numeric"
              onChangeText={setAmount}
            />
            <TouchableOpacity style={styles.input}>
              <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCategory(itemValue)}
                style={{ height: 50, width: '100%' }}
              >
                <Picker.Item label="Select Category" value="" />
                <Picker.Item label="Utilities" value="Utilities" />
                <Picker.Item label="Groceries" value="Groceries" />
                <Picker.Item label="Rent" value="Rent" />
                <Picker.Item label="Miscellaneous" value="Miscellaneous" />
              </Picker>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={addExpense}>
              <Text style={styles.addButtonText}>Add Expense</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <FlatList
          data={expensesList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderExpenseCard}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyMessage}>No expenses found. Add some!</Text>}
        />
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  totalText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  settledText: {
    fontSize: 16,
    color: '#FFD700',
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
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
    position: 'relative',
  },
  settledCard: {
    backgroundColor: '#f9f9f9',
  },
  cardIcon: {
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
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
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settleButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginRight: 10,
  },
  settleButtonText: {
    color: '#333',
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

export default ExpensesScreen;
