import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Alert, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { saveGame, loadGame } from './data/storage';
import ShopButton from './components/ShopButton';
import * as Haptics from 'expo-haptics';
import { BUSINESSES, Business, costOf } from './data/businesses';
import { formatMoney } from './utils/format';
import { COLORS } from './constants/colors';
import { useAudioPlayer } from 'expo-audio';


export default function App() {
  const [money, setMoney] = useState(0);

  const [managers, setManagers] = useState(0);

  const [training, setTraining] = useState(0);

  const kaching = useAudioPlayer(require('./assets/sounds/coins-dropped.wav'));

  const [owned, setOwned] = useState<{ [id: string]: number }>({ coffee: 0, foodtruck: 0 });

  const [isLoaded, setIsLoaded] = useState(false);
  let businessIncome = 0;
  for (const biz of BUSINESSES) {
    businessIncome += (owned[biz.id] || 0) * biz.income;
  }
  const managerIncome = 2 * (training + 1);
  const incomePerSecond = managers * managerIncome + businessIncome;
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    kaching.seekTo(0);
    kaching.play();
  }
};

const buyTraining = () => {
  if (money >= trainingCost) {
    setMoney(money - trainingCost);
    setTraining(training + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    kaching.seekTo(0);
    kaching.play();
  }
};


const buyBusiness = (biz: Business) => {
  const cost = costOf(biz, owned[biz.id] || 0);
  if (money >= cost) {
    setMoney(money - cost);
    setOwned({ ...owned, [biz.id]: (owned[biz.id] || 0) + 1 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    kaching.seekTo(0);
    kaching.play();
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
    label: biz.name + " ($" + formatMoney(costOf(biz, owned[biz.id] || 0)) + ")",
    onPress: () => buyBusiness(biz),
    disabled: money < costOf(biz, owned[biz.id] || 0),
  })),
]

useEffect(() => {
  const load = async () => {
    const data = await loadGame();
    if (data !== null) {
      let loadedMoney = data.money;
      if (data.lastSaved) {
        const secondsAway = Math.floor((Date.now() - data.lastSaved) / 1000);
        let income = data.managers * 2 * (data.training + 1);
        for (const biz of BUSINESSES) {
          income += (data.owned[biz.id] || 0) * biz.income;
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
      setOwned(data.owned);
    }
    setIsLoaded(true);
  };
  load();
}, []);

useEffect(() => {
  if (!isLoaded) return;
  saveGame({ money, managers, training, owned, lastSaved: Date.now() });
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
    {biz.name}s: {owned[biz.id] || 0} owned (+${formatMoney((owned[biz.id] || 0) * biz.income)}/sec)
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
    backgroundColor: COLORS.background,
  },
  header: {
  paddingTop: 70,
  paddingBottom: 20,
  alignItems: 'center',
  borderBottomWidth: 1,
  borderBottomColor: COLORS.border,
},
scrollContent: {
  padding: 24,
  gap: 12,
},
sectionHeader: {
  fontSize: 14,
  fontWeight: 'bold',
  color: COLORS.green,
  marginTop: 16,
  letterSpacing: 2,
},
  money: {
    fontSize:48,
    fontWeight: 'bold',
    color: COLORS.green,
  },
  label: {
    fontSize: 18,
    color: COLORS.gray,
  },

});