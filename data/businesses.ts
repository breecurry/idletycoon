
export type Business = {
  id: string;
  name: string;
  baseCost: number;
  growth: number;
  income: number;
  minRebrands?: number;
};

export const BUSINESSES: Business[] = [
  { id: 'coffee', name: 'Coffee Machine', baseCost: 500, growth: 1.7, income: 100 },
  { id: 'foodtruck', name: 'Food Truck', baseCost: 5000, growth: 1.8, income: 500 },
  { id: 'flowershop', name: 'Flower Shop', baseCost: 60000, growth: 1.9, income: 3000 },
  { id: 'computerstore', name: 'Computer Store', baseCost: 100000, growth: 2.1, income: 10000, minRebrands: 1 },
  { id: 'candyshop', name: 'Candy Shop', baseCost: 250000, growth: 2.2, income: 25000, minRebrands: 2 },
  { id: 'boutique', name: 'Bella Boutique', baseCost: 750000, growth: 2.3, income: 100000, minRebrands: 5 },
  { id: 'petstore', name: 'Petsupply USA', baseCost: 1250000, growth: 2.4, income: 250000, minRebrands: 15},
  { id: 'newspaper', name: 'Curry Post', baseCost: 12500000, growth: 2.5, income: 1000000, minRebrands: 20},
  { id: 'tvstation', name: 'PWR TV', baseCost: 500000000, growth: 1.5, income: 107500000, minRebrands: 22},
  { id: 'hairsalon', name: 'Big Hair Salon', baseCost: 1000000000, growth: 1.75, income: 50000000, minRebrands: 23},
  { id: 'skyscraper', name: 'Skyscraper', baseCost: 1000000000000, growth: 2.5, income: 50000000, minRebrands: 25 },
];

export const costOf = (biz: Business, count: number) =>
    Math.floor(biz.baseCost * Math.pow(biz.growth, count));