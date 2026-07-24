export const formatMoney = (amount: number) => {
  if (amount >= 1000000000) return (amount / 1000000000).toFixed(2) + "B";
  if (amount >= 1000000) return (amount / 1000000).toFixed(2) + "M";
  if (amount >= 1000) return (amount / 1000).toFixed(2) + "K";
  return amount.toString();
};