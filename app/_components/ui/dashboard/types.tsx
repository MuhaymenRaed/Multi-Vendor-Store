export type TabType =
  | "overview"
  | "users"
  | "stores"
  | "products"
  | "discounts"
  | "revenue"
  | "requests";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
}

export interface Store {
  id: number;
  name: string;
  dealer: string;
  products: number;
  revenue: string;
  status: string;
}

export interface Product {
  id: number;
  name: string;
  store: string;
  category: string;
  price: string;
  stock: number;
  status: string;
}

export interface Stat {
  label: string;
  value: string;
  icon: string;
  change: string;
  trend: "up" | "down";
  color: string;
}

export interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
  growth: number;
}

export interface Request {
  id: number;
  store: string;
  product: string;
  quantity: number;
  status: string;
  date: string;
}
