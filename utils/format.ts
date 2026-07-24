const SUFFIXES = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];

export function formatMoney(amount: number): string
 {
  if (amount < 1000) {
    return Math.floor(amount).toString();
  }
    let value = amount;
    let tier = 0;

    while (value >= 1000 && tier < SUFFIXES.length - 1) {
      value /= 1000;
      tier++;
    }

    return value.toFixed(2) + SUFFIXES[tier];
};