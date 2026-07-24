
export type Business = {
  id: string;
  name: string;
  baseCost: number;
  growth: number;
  income: number;
};

export const BUSINESSES: Business[] = [
  { id: 'coffee', name: 'Coffee Machine', baseCost: 500, growth: 1.7, income: 25 },
  { id: 'foodtruck', name: 'Food Truck', baseCost: 5000, growth: 1.8, income: 150 },
];

export const costOf = (biz: Business, count: number) =>
    Math.floor(biz.baseCost * Math.pow(biz.growth, count));