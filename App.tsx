import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Alert, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ShopButton from './components/ShopButton';
import * as Haptics from 'expo-haptics';

const formatMoney = (amount: number) => {
  if (amount >= 1000000000) return (amount / 1000000000).toFixed(2) + "B";
  if (amount >= 1000000) return (amount / 1000000).toFixed(2) + "M";
  if (amount >= 1000) return (amount / 1000).toFixed(2) + "K";
  return amount.toString();
};

type Business = {
  id: string;
  name: string;
  baseCost: number;
  growth: number;
  income: number;
};

const BUSINESSES: Business[] = [
  { id: 'coffee', name: 'Coffee Machine', baseCost: 500, growth: 1.7, income: 25 },
  { id: 'foodtruck', name: 'Food Truck', baseCost: 5000, growth: 1.8, income: 150 },
];

export default function App() {
  const [money, setMoney] = useState(0);

  const [managers, setManagers] = useState(0);

  const [training, setTraining] = useState(0);

  const [owned, setOwned] = useState<{ [id: string]: number }>({ coffee: 0, foodtruck: 0 });

  const [isLoaded, setIsLoaded] = useState(false);
  let businessIncome = 0;
  for (const biz of BUSINESSES) {
    businessIncome += owned[biz.id] * biz.income;
  }
  const managerIncome = 2 * (training + 1);
  const incomePerSecond = managers * managerIncome + businessIncome;
  const managerCost = Math.floor(10 * Math.pow(1.5, managers));
  const trainingCost = Math.floor(50 * Math.pow(2, training));
  const costOf = (biz: Business) =>
    Math.floor(biz.baseCost * Math.pow(biz.growth, owned[biz.id]));

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
};

const buyTraining = () => {
  if (money >= trainingCost) {
    setMoney(money - trainingCost);
    setTraining(training + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
};

const buyBusiness = (biz: Business) => {
  const cost = costOf(biz);
  if (money >= cost) {
    setMoney(money - cost);
    setOwned({ ...owned, [biz.id]: owned[biz.id] + 1 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
  ...BUSINESSES.map(biz => ({
    label: biz.name + " ($" + formatMoney(costOf(biz)) + ")",
    onPress: () => buyBusiness(biz),
    disabled: money < costOf(biz),
  })),
];



useEffect(() => {
  const load = async () => {
    const saved = await
    AsyncStorage.getItem('gameData');
    if (saved !== null) {
      const data = JSON.parse(saved);
      const savedOwned = data.owned || { coffee: data.coffee || 0, foodtruck: data.foodtruck || 0 };
      
      let loadedMoney = data.money;

      if (data.lastSaved) {
        const secondsAway = Math.floor((Date.now() - data.lastSaved) / 1000);
       
        let income = data.managers * 2 * (data.training + 1);
        for (const biz of BUSINESSES) {
          income += (savedOwned[biz.id] || 0) * biz.income;
        }
        const offlineEarnings = secondsAway * income;

        if (offlineEarnings > 0) {
          loadedMoney = loadedMoney + offlineEarnings;
          Alert.alert("Welcome back!", "Your businesses earned $" + formatMoney(offlineEarnings) + " while you were away.");
        }
        }
        setMoney(loadedMoney);
        setManagers(data.managers);
        setTraining(data.training);
        setOwned(data.owned || {});
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
    owned,
    lastSaved: Date.now(),
  }));
}, [money, managers, training, owned, isLoaded]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <Text style={styles.money}>Money: ${formatMoney(money)}</Text>
     </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.sectionHeader}>MY BUSINESSES</Text>
      <Text style={styles.label}>Managers: {managers} (+${formatMoney(managers * managerIncome)}/sec) </Text>
      
      <Text style={styles.label}>Training Level: {training} (${formatMoney(managerIncome)}/manager)</Text>
      
    {BUSINESSES.map(biz => (
      <Text key={biz.id} style={styles.label}>
        {biz.name}s: {owned[biz.id]} owned (+${formatMoney(owned[biz.id] * biz.income)}/sec)
      </Text>
    ))}
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

});