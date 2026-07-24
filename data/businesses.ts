
export type Business = {
  id: string;
  name: string;
  baseCost: number;
  growth: number;
  income: number;
};

export const BUSINESSES: Business[] = [
  { id: 'coffee', name: 'Coffee Machine', baseCost: 500, growth: 1.7, income: 100 },
  { id: 'foodtruck', name: 'Food Truck', baseCost: 5000, growth: 1.8, income: 500 },
  { id: 'Flower Shop', name: 'Flower Shop', baseCost: 10000, growth: 1.9, income: 3000 },
  { id: 'Computer Store', name: 'Computer Store', baseCost: 100000, growth: 2.3, income: 10000 },
];

export const costOf = (biz: Business, count: number) =>
    Math.floor(biz.baseCost * Math.pow(biz.growth, count));