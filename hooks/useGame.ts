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
  const [tapPower, setTapPower] = useState(0);
  const [owned, setOwned] = useState<{ [id: string]: number }>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [bestMoney, setBestMoney] = useState(0);
  const [brandValue, setBrandValue] = useState(0);
  const [rebrands, setRebrands] = useState(0);
  const [lifetimeRun, setLifetimeRun] = useState (0);
  const [lifetimeTotal, setLifetimeTotal] = useState (0);
  const kaching = useAudioPlayer(require('../assets/sounds/coins-dropped.wav'));

  const prestigeMultiplier = 1 + brandValue * ECONOMY.prestigeBonus;

const incomeOf = (biz: Business) => {
  const count = owned[biz.id] || 0;
  const bonus = count >= ECONOMY.milestoneCount ? ECONOMY.milestoneBonus : 1;
  return count * biz.income * bonus * prestigeMultiplier;
};
  let businessIncome = 0;
  for (const biz of BUSINESSES) {
    businessIncome += incomeOf(biz);
  }

  const managerIncome = ECONOMY.managerBasePay * 
  (training + 1) * prestigeMultiplier;
  
  const incomePerSecond = managers * managerIncome + businessIncome;
  
  const managerCost = Math.floor(ECONOMY.managerBaseCost * 
    Math.pow(ECONOMY.managerCostGrowth, managers));
  
  const trainingCost = Math.floor(ECONOMY.trainingBaseCost * 
    Math.pow(ECONOMY.trainingCostGrowth, training));
  
  const tapPowerCost =
  Math.floor(ECONOMY.tapPowerBaseCost * 
  Math.pow(ECONOMY.tapPowerCostGrowth, tapPower));
  
  const workValue = Math.max(ECONOMY.workPay, incomePerSecond * 
    ECONOMY.workRatio) * (tapPower + 1);
  
  const pendingBrandValue = 
  Math.floor(Math.sqrt(lifetimeRun / ECONOMY.prestigeDivisor));

  useEffect(() => {
    if (money > bestMoney) setBestMoney(money);
  }, [money, bestMoney]);
    
    const visibleBusinesses = BUSINESSES.filter(biz => 
      rebrands >= (biz.minRebrands || 0) &&
      ((owned[biz.id] || 0) > 0 || bestMoney >= 
      biz.baseCost * ECONOMY.unlockRatio)
    );

  const lockedBusinesses = BUSINESSES.filter(biz => rebrands < (biz.minRebrands || 0));

  const purchaseFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    kaching.seekTo(0);
    kaching.play();
  };

  const earn = (amount: number) => {
    setMoney(current => current + amount);
    setLifetimeRun(current => current + amount);
    setLifetimeTotal(current => current + amount);
  };
  const work = () => {
    earn(workValue);
  };
  const hireManager = () => {
    if (money >= managerCost) {
      setMoney(current => current - managerCost);
      setManagers(current => current + 1);
      purchaseFeedback();
    }
  };
  const buyTraining = () => {
    if (money >= trainingCost) {
      setMoney(current => current - trainingCost);
      setTraining(current => current + 1);
      purchaseFeedback();
    }
  };
  const buyTapPower = () => {
    if (money >= tapPowerCost) {
      setMoney(current => current - tapPowerCost);
      setTapPower(current => current + 1);
      purchaseFeedback();
    }
  };
  const buyBusiness = (biz: Business) => {
    const cost = costOf(biz, owned[biz.id] || 0);
    if (money >= cost) {
      setMoney(current => current - cost);
      setOwned(current => ({ ...current, [biz.id]: (current[biz.id] || 0) + 1}));
      purchaseFeedback();
    }
  };

const sellAndRebrand = () => {
  if (pendingBrandValue < 1) return;
  Alert.alert(
    "Sell & Rebrand?",
    "Sell everything for " + pendingBrandValue + " Brand Value(+" + Math.round(pendingBrandValue * ECONOMY.prestigeBonus * 100 ) + "% income, forever). Money, Staff, and businesses reset.",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sell",
        style: "destructive",
        onPress: () => {
          setBrandValue(current => current + pendingBrandValue);
          setMoney(0);
          setManagers(0);
          setTraining(0);
          setTapPower(0);
          setOwned({});
          setBestMoney(0);
          setRebrands(current => current + 1);
          setLifetimeRun(0);
          purchaseFeedback();
         
        },
      },
    ]
  );
};

  useEffect(() => {
    const interval = setInterval(() => {
      earn(incomePerSecond);
    }, 1000);
    return () => clearInterval(interval);
  }, [incomePerSecond]);

  useEffect(() => {
    const load = async () => {
      const data = await loadGame();
      if (data !== null) {
        let loadedMoney = data.money;
        let offlineEarnings = 0;

        if (data.lastSaved) {
          const secondsAway = Math.floor((Date.now() - 
          data.lastSaved) / 1000);
          
          let income = data.managers * ECONOMY.managerBasePay 
          * (data.training + 1);
          
          for (const biz of BUSINESSES) {
            const count = data.owned[biz.id] || 0;
            const bonus = count >=
            ECONOMY.milestoneCount ?
            ECONOMY.milestoneBonus : 1;
            income += count * biz.income * bonus;
          }
         
          income = income * (1 + data.brandValue * ECONOMY.prestigeBonus);
          offlineEarnings = secondsAway * income;

          if (offlineEarnings > 0) {
            loadedMoney = loadedMoney + offlineEarnings;
            Alert.alert("Welcome back!", "Your businesses earned $" 
              + formatMoney(offlineEarnings) + " while you were away.");
          }
        }

        setMoney(loadedMoney);
        setManagers(data.managers);
        setTraining(data.training);
        setTapPower(data.tapPower);
        setOwned(data.owned);
        setBestMoney(data.bestMoney);
        setBrandValue(data.brandValue);
        setRebrands(data.rebrands);
        setLifetimeRun(data.lifetimeRun + offlineEarnings);
        setLifetimeTotal(data.lifetimeTotal + offlineEarnings);
      }
      setIsLoaded(true);
    };
    load();
  }, []);


  useEffect(() => {
    if (!isLoaded) return;
    saveGame({ money, managers, training, tapPower, owned, bestMoney, brandValue, rebrands, lifetimeRun, lifetimeTotal, lastSaved: Date.now() });
  }, [money, managers, training, tapPower, owned, bestMoney, brandValue, rebrands, lifetimeRun, lifetimeTotal, isLoaded]);
  return {
    money,
    managers,
    training,
    owned,
    bestMoney,
    brandValue,
    rebrands,
    prestigeMultiplier,
    pendingBrandValue,
    lifetimeRun,
    lifetimeTotal,
    managerIncome,
    managerCost,
    trainingCost,
    tapPower,
    tapPowerCost,
    workValue,
    incomePerSecond,
    lockedBusinesses,
    buyTapPower,
    incomeOf,
    work,
    hireManager,
    buyTraining,
    buyBusiness,
    sellAndRebrand,
    visibleBusinesses,
  };
};