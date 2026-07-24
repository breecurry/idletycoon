import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, Alert, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const formatMoney = (amount: number) => {
  if (amount >= 1000000000) return (amount / 1000000000).toFixed(2) + "B";
  if (amount >= 1000000) return (amount / 1000000).toFixed(2) + "M";
  if (amount >= 1000) return (amount / 1000).toFixed(2) + "K";
  return amount.toString();
};

type ShopButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

const ShopButton = ({ label, onPress, disabled }: ShopButtonProps) => {
  return (
    <Pressable
    style={[styles.button, disabled && styles.buttonDisabled]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.buttonText}>{label}</Text>
  </Pressable>
);
};

export default function App() {
  const [money, setMoney] = useState(0);

  const [managers, setManagers] = useState(0);

  const [training, setTraining] = useState(0);

  const [coffee, setCoffee] = useState(0);

  const [foodtruck, setFoodtruck] = useState(0);

  const [isLoaded, setIsLoaded] = useState(false);

  const managerIncome = 2 * (training + 1);
  const coffeeIncome = coffee * 25;
  const foodtruckIncome = foodtruck * 150;
  const incomePerSecond = managers * managerIncome + coffeeIncome + foodtruckIncome;
  const managerCost = Math.floor(10 * Math.pow(1.5, managers));
  const trainingCost = Math.floor(50 * Math.pow(2, training));
  const coffeeCost = Math.floor(500 * Math.pow(1.7, coffee));
  const foodtruckCost = Math.floor(5000 * Math.pow(1.8, foodtruck));

  useEffect(() => {
    const interval = setInterval(() => {
      setMoney(current => current + incomePerSecond);
    }, 1000);
    return () => clearInterval(interval);
  }, [incomePerSecond]);


const hireManager = () => {
  if (money >= managerCost  ) {
    setMoney(money - managerCost);
    setManagers(managers + 1);
  }
};

const buyTraining = () => {
  if (money >= trainingCost) {
    setMoney(money - trainingCost);
    setTraining(training + 1);
  }
};

const buyCoffee = () => {
  if (money >= coffeeCost) {
    setMoney(money - coffeeCost);
    setCoffee(coffee + 1);
  }
};

const buyFoodtruck = () => {
  if (money >= foodtruckCost) {
    setMoney(money - foodtruckCost);
    setFoodtruck(foodtruck + 1);
  }
};

const shopItems = [
  {
    label: "Hire Manager ($" + formatMoney(managerCost) + ")",
    onPress: hireManager,
    disabled: money < managerCost, 
  },
  {
    label: "Train Staff ($" + formatMoney(trainingCost) + ")",
    onPress: buyTraining,
    disabled: money < trainingCost,
  },
  {
    label: "Coffee Machine ($" + formatMoney(coffeeCost) + ")",
    onPress: buyCoffee,
    disabled: money < coffeeCost,
  },
  {
    label: "Food Truck ($" + formatMoney(foodtruckCost) + ")",
    onPress: buyFoodtruck,
    disabled: money < foodtruckCost,
  },
];



useEffect(() => {
  const load = async () => {
    const saved = await
    AsyncStorage.getItem('gameData');
    if (saved !== null) {
      const data = JSON.parse(saved);
      
      let loadedMoney = data.money;

      if (data.lastSaved) {
        const secondsAway = Math.floor((Date.now() - data.lastSaved) / 1000);
        const income = data.managers * 2 * (data.training + 1) + (data.coffee || 0) * 25 + (data.foodtruck || 0) * 150;
        const offlineEarnings = secondsAway * income;

        if (offlineEarnings > 0) {
          loadedMoney = loadedMoney + offlineEarnings;
          Alert.alert("Welcome back!", "Your businesses earned " + formatMoney(offlineEarnings) + " while you were away.");
        }
        }
        setMoney(loadedMoney);
        setManagers(data.managers);
        setTraining(data.training);
        setCoffee(data.coffee || 0);
        setFoodtruck(data.foodtruck || 0);
      }
      setIsLoaded(true);
    };
    load();
  }, []);

useEffect(() => {
  if (!isLoaded) return;
  AsyncStorage.setItem('gameData', JSON.stringify({
    money,
    managers,
    training,
    coffee,
    foodtruck,
    lastSaved: Date.now(),
  }));
}, [money, managers, training, coffee, foodtruck, isLoaded]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <Text style={styles.money}>Money: ${formatMoney(money)}</Text> </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.sectionHeader}>MY BUSINESSES</Text>
      <Text style={styles.label}>Managers: {managers} (+${formatMoney(managers * managerIncome)}/sec) </Text>
      
      <Text style={styles.label}>Training Level: {training} (${formatMoney(managerIncome)}/manager)</Text>
      
      <Text style={styles.label}>Coffee Machines: {coffee} (+${formatMoney(coffeeIncome)}/sec)</Text>
      <Text style={styles.label}>Food Trucks: {foodtruck} (+${formatMoney(foodtruckIncome)}/sec)</Text>
      <Text style={styles.sectionHeader}>SHOP</Text>
      <ShopButton label="Work ($1)" onPress={() => setMoney(money + 1)} />
      {shopItems.map((item => (
        <ShopButton
          key={item.label}
          label={item.label}
          onPress={item.onPress}
          disabled={item.disabled}
        />
      )))}
       </ScrollView>
      <StatusBar style="auto" />
    </View>
   
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
  paddingTop: 70,
  paddingBottom: 20,
  alignItems: 'center',
  borderBottomWidth: 1,
  borderBottomColor: '#2a2a4e',
},
scrollContent: {
  padding: 24,
  gap: 12,
},
sectionHeader: {
  fontSize: 14,
  fontWeight: 'bold',
  color: '#4ade80',
  marginTop: 16,
  letterSpacing: 2,
},
  money: {
    fontSize:48,
    fontWeight: 'bold',
    color: '#4ade80',
  },
  label: {
    fontSize: 18,
    color: '#aaaaaa',
  },
  button: {
    backgroundColor: '#4ade80',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    color: '#1a1a2e',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#555566',
  },
});