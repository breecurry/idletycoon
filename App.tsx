import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, Alert } from 'react-native';
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

  const [isLoaded, setIsLoaded] = useState(false);

  const managerIncome = 2 * (training + 1);
  const incomePerSecond = managers * managerIncome;
  const managerCost = Math.floor(10 * Math.pow(1.5, managers));
  const trainingCost = Math.floor(50 * Math.pow(2, training));
  

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

useEffect(() => {
  const load = async () => {
    const saved = await
    AsyncStorage.getItem('gameData');
    if (saved !== null) {
      const data = JSON.parse(saved);
      
      let loadedMoney = data.money;

      if (data.lastSaved) {
        const secondsAway = Math.floor((Date.now() - data.lastSaved) / 1000);
        const income = data.managers * 2 * (data.training + 1);
        const offlineEarnings = secondsAway * income;

        if (offlineEarnings > 0) {
          loadedMoney = loadedMoney + offlineEarnings;
          Alert.alert("Welcome back!", "Your managers earned $" + formatMoney(offlineEarnings) + " while you were away.");
        }
        }
        setMoney(loadedMoney);
        setManagers(data.managers);
        setTraining(data.training);
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
    lastSaved: Date.now(),
  }));
}, [money, managers, training, isLoaded]);

  return (
    <View style={styles.container}>
      
      <Text style={styles.money}>Money: ${formatMoney(money)}</Text>
      
      <Text style={styles.label}>Managers: {managers} (+${formatMoney(incomePerSecond)}/sec)</Text>
      
      <Text style={styles.label}>Training Level: {training} (${formatMoney(managerIncome)}/manager)</Text>
      
      <ShopButton label={"Train Staff ($" + formatMoney(trainingCost) + ")"} onPress={buyTraining} disabled={money < trainingCost} />

      <ShopButton label="Work ($1)" onPress={() => setMoney(money + 1)} />

      <ShopButton label={"Hire Manager ($" + formatMoney(managerCost) + ")"} onPress={hireManager} disabled={money < managerCost} />

      <StatusBar style="auto" />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
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