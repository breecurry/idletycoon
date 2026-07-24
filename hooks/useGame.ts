import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAudioPlayer } from 'expo-audio';
import { BUSINESSES, Business, costOf } from '../data/businesses';
import { ECONOMY } from '../data/economy';
import { saveGame, loadGame } from '../data/storage';
import { formatMoney } from '../utils/format';
export const useGame = () => {
  const [money, setMoney] = useState(0);
  const [managers, setManagers] = useState(0);
  const [training, setTraining] = useState(0);
  const [owned, setOwned] = useState<{ [id: string]: number }>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const kaching = useAudioPlayer(require('../assets/sounds/coins-dropped.wav'));
  let businessIncome = 0;
  for (const biz of BUSINESSES) {
    businessIncome += (owned[biz.id] || 0) * biz.income;
  }
  const managerIncome = ECONOMY.managerBasePay * (training + 1);
  const incomePerSecond = managers * managerIncome + businessIncome;
  const managerCost = Math.floor(ECONOMY.managerBaseCost * Math.pow(ECONOMY.managerCostGrowth, managers));
  const trainingCost = Math.floor(ECONOMY.trainingBaseCost * Math.pow(ECONOMY.trainingCostGrowth, training));
  const purchaseFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    kaching.seekTo(0);
    kaching.play();
  };
  const work = () => {
    setMoney(money + ECONOMY.workPay);
  };
  const hireManager = () => {
    if (money >= managerCost) {
      setMoney(money - managerCost);
      setManagers(managers + 1);
      purchaseFeedback();
    }
  };
  const buyTraining = () => {
    if (money >= trainingCost) {
      setMoney(money - trainingCost);
      setTraining(training + 1);
      purchaseFeedback();
    }
  };
  const buyBusiness = (biz: Business) => {
    const cost = costOf(biz, owned[biz.id] || 0);
    if (money >= cost) {
      setMoney(money - cost);
      setOwned({ ...owned, [biz.id]: (owned[biz.id] || 0) + 1 });
      purchaseFeedback();
    }
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setMoney(current => current + incomePerSecond);
    }, 1000);
    return () => clearInterval(interval);
  }, [incomePerSecond]);
  useEffect(() => {
    const load = async () => {
      const data = await loadGame();
      if (data !== null) {
        let loadedMoney = data.money;
        if (data.lastSaved) {
          const secondsAway = Math.floor((Date.now() - data.lastSaved) / 1000);
          let income = data.managers * ECONOMY.managerBasePay * (data.training + 1);
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
  return {
    money,
    managers,
    training,
    owned,
    managerIncome,
    managerCost,
    trainingCost,
    incomePerSecond,
    work,
    hireManager,
    buyTraining,
    buyBusiness,
  };
};