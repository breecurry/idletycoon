import AsyncStorage from '@react-native-async-storage/async-storage';
export type SaveData = {
  money: number;
  managers: number;
  training: number;
  owned: { [id: string]: number };
  lastSaved: number;
};
export const saveGame = (data: SaveData) => {
  AsyncStorage.setItem('gameData', JSON.stringify(data));
};
export const loadGame = async () => {
  const saved = await AsyncStorage.getItem('gameData');
  if (saved === null) return null;
  const data = JSON.parse(saved);
  return {
    money: data.money || 0,
    managers: data.managers || 0,
    training: data.training || 0,
    owned: data.owned || { coffee: data.coffee || 0, foodtruck: data.foodtruck || 0 },
    lastSaved: data.lastSaved || 0,
  };
};
export const clearSave = () => {
  AsyncStorage.removeItem('gameData');
};