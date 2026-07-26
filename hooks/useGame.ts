import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useAudioPlayer } from 'expo-audio';
import { BUSINESSES, Business, costOf } from '../data/businesses';
import { ECONOMY } from '../data/economy';
import { saveGame, loadGame, SaveData } from '../data/storage';
import { formatMoney } from '../utils/format';

type GameState = Omit<SaveData, 'lastSaved'>;
export const useGame = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [game, setGame] = useState<GameState>({
    money: 0,
    managers: 0,
    training: 0,
    tapPower: 0,
    owned: {},
    bestMoney: 0,
    brandValue: 0,
    rebrands: 0,
    lifetimeRun: 0,
    lifetimeTotal: 0,
  });
  const kaching = useAudioPlayer(require('../assets/sounds/coins-dropped.wav'));

  const prestigeMultiplier = 1 + game.brandValue * ECONOMY.prestigeBonus;

const incomeOf = (biz: Business) => {
  const count = game.owned[biz.id] || 0;
  const bonus = count >= ECONOMY.milestoneCount ? ECONOMY.milestoneBonus : 1;
  return count * biz.income * bonus * prestigeMultiplier;
};
  let businessIncome = 0;
  for (const biz of BUSINESSES) {
    businessIncome += incomeOf(biz);
  }

  const managerIncome = ECONOMY.managerBasePay * 
  (game.training + 1) * prestigeMultiplier;
  
  const incomePerSecond = game.managers * managerIncome + businessIncome;
  
  const managerCost = Math.floor(ECONOMY.managerBaseCost * 
    Math.pow(ECONOMY.managerCostGrowth, game.managers));
  
  const trainingCost = Math.floor(ECONOMY.trainingBaseCost * 
    Math.pow(ECONOMY.trainingCostGrowth, game.training));
  
  const tapPowerCost =
  Math.floor(ECONOMY.tapPowerBaseCost * 
  Math.pow(ECONOMY.tapPowerCostGrowth, game.tapPower));
  
  const workValue = Math.max(ECONOMY.workPay, incomePerSecond * 
    ECONOMY.workRatio) * (game.tapPower + 1);
  
  const pendingBrandValue = 
  Math.floor(Math.sqrt(game.lifetimeRun / ECONOMY.prestigeDivisor));

  useEffect(() => {
    setGame(current => {
      if (current.money > current.bestMoney) {
        return {...current, bestMoney: current.money};
      }
      return current;
    });
  }, [game.money]);
    
    const visibleBusinesses = BUSINESSES.filter(biz => 
      game.rebrands >= (biz.minRebrands || 0) &&
      ((game.owned[biz.id] || 0) > 0 || game.bestMoney >= 
      biz.baseCost * ECONOMY.unlockRatio)
    );

  const lockedBusinesses = BUSINESSES.filter(biz => game.rebrands < (biz.minRebrands || 0));

  const purchaseFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    kaching.seekTo(0);
    kaching.play();
  };

  const earn = (amount: number) => {
    setGame(current => ({
      ...current,
      money: current.money + amount,
      lifetimeRun: current.lifetimeRun + amount,
      lifetimeTotal: current.lifetimeTotal + amount,
    }));
  };

  const work = () => {
    earn(workValue);
  };
  const hireManager = () => {
    if (game.money >= managerCost) {
      setGame(current => {
        if (current.money < managerCost) return current;
        return {
          ...current,
          money: current.money - managerCost,
          managers: current.managers + 1,
        };
      });
              purchaseFeedback();
    }
    };
  const buyTraining = () => {
    if (game.money >= trainingCost) {
      setGame(current => {
        if (current.money < trainingCost) return current;
        return {
          ...current,
          money: current.money - trainingCost,
          training: current.training + 1,
        };
      });
              purchaseFeedback();
    }
  };
  const buyTapPower = () => {
    if (game.money >= tapPowerCost) {
      setGame(current => {
        if (current.money < tapPowerCost) return current;
        return {
          ...current,
          money: current.money - tapPowerCost,
          tapPower: current.tapPower + 1,
        };
      });
              purchaseFeedback();
    }
  };
  const buyBusiness = (biz: Business) => {
    const cost = costOf(biz, game.owned[biz.id] || 0);
    if (game.money >= cost) {
      setGame(current => {
        const freshCost = costOf(biz, current.owned[biz.id] || 0);
        if (current.money < freshCost) return current;
        return{
          ...current,
          money: current.money - freshCost,
          owned: { ...current.owned, [biz.id]: (current.owned[biz.id] || 0) + 1 },
        };
      });
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
          setGame(current => ({
            ...current,
            brandValue: current.brandValue + pendingBrandValue,
            rebrands: current.rebrands + 1,
            money: 0,
            managers: 0,
            training: 0,
            tapPower: 0,
            owned: {},
            bestMoney: 0,
            lifetimeRun: 0,
          }));
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

        setGame({
          money: loadedMoney,
          managers: data.managers,
          training: data.training,
          tapPower: data.tapPower,
          owned: data.owned,
          bestMoney: data.bestMoney,
          brandValue: data.brandValue,
          rebrands: data.rebrands,
          lifetimeRun: data.lifetimeRun + offlineEarnings,
          lifetimeTotal: data.lifetimeTotal + offlineEarnings,
        });
      }
      setIsLoaded(true);
    };
    load();
  }, []);


  useEffect(() => {
    if (!isLoaded) return;
    saveGame({
      ...game,
      lastSaved: Date.now()
    }); }, [game, isLoaded]);
  return {
    money: game.money,
    managers: game.managers,
    training: game.training,
    owned: game.owned,
    bestMoney: game.bestMoney,
    brandValue: game.brandValue,
    rebrands: game.rebrands,
    prestigeMultiplier,
    pendingBrandValue,
    lifetimeRun: game.lifetimeRun,
    lifetimeTotal: game.lifetimeTotal,
    managerIncome,
    managerCost,
    trainingCost,
    tapPower: game.tapPower,
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