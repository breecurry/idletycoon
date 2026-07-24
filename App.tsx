import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Header from './components/Header';
import StatRow from './components/StatRow';
import ShopButton from './components/ShopButton';
import { costOf } from './data/businesses';
import { ECONOMY } from './data/economy';
import { formatMoney } from './utils/format';
import { COLORS } from './constants/colors';
import { useGame } from './hooks/useGame';

export default function App() {
  const game = useGame();

  const shopItems = [
    {
      label: "Hire Manager ($" + formatMoney(game.managerCost) + ")",
      onPress: game.hireManager,
      disabled: game.money < game.managerCost,
    },
    {
      label: "Train Staff ($" + formatMoney(game.trainingCost) + ")",
      onPress: game.buyTraining,
      disabled: game.money < game.trainingCost,
    },
...game.visibleBusinesses.map(biz => ({
      label: biz.name + " ($" + formatMoney(costOf(biz, game.owned[biz.id] || 0)) + ")",
      onPress: () => game.buyBusiness(biz),
      disabled: game.money < costOf(biz, game.owned[biz.id] || 0),
    })),
  ];

  return (
    <View style={styles.container}>

      <Header money={game.money} incomePerSecond={game.incomePerSecond} />

      <ScrollView contentContainerStyle={styles.scrollContent}>

        <Text style={styles.sectionHeader}>MY BUSINESSES</Text>
        
        <StatRow label={"Managers: " + game.managers} detail={"+$" + formatMoney(game.managers * game.managerIncome) + "/sec"} />
       
        <StatRow label={"Training Level: " + game.training} detail={"$" + formatMoney(game.managerIncome) + "/manager"} />
        
        {game.visibleBusinesses.map(biz => (
          <StatRow
            key={biz.id}
            label={biz.name + "s: " + (game.owned[biz.id] || 0) + " owned"}
            detail={"+$" + formatMoney((game.owned[biz.id] || 0) * biz.income) + "/sec"}
          />
        ))}
       
        <Text style={styles.sectionHeader}>SHOP</Text>
        
        <ShopButton label={"Work (+$" + ECONOMY.workPay + ")"} onPress={game.work} />
        
        {shopItems.map(item => (
          <ShopButton
            key={item.label}
            label={item.label}
            onPress={item.onPress}
            disabled={item.disabled}
          />
        ))}
      
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
});