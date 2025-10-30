// API 响应类型定义
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// 产品相关类型
export interface Product {
  id: string;
  name: string;
  description: string;
  brand?: string;
  category?: string;
  imageUrl?: string;
  prices: Price[];
  createdAt: string;
  updatedAt: string;
}

export interface Price {
  id: string;
  price: number;
  currency: string;
  source: string;
  url: string;
  createdAt: string;
}

// 用户相关类型
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface UserProfile extends User {
  subscription: SubscriptionStatus;
  statistics: UserStatistics;
  searchHistory: SearchHistory[];
}

export interface SubscriptionStatus {
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  validUntil: string;
  features: string[];
}

export interface UserStatistics {
  totalSearches: number;
  savedProducts: number;
  alertsCreated: number;
}

export interface SearchHistory {
  id: string;
  query: string;
  createdAt: string;
}

// 套利机会相关类型
export interface ArbitrageOpportunity {
  id: string;
  productId: string;
  productName: string;
  sourceCountry: string;
  targetCountry: string;
  sourcePlatform: string;
  targetPlatform: string;
  sourcePrice: PriceInfo;
  targetPrice: PriceInfo;
  profitRate: number;
  absoluteProfit: number;
  updatedAt: string;
}

export interface PriceInfo {
  amount: number;
  currency: string;
  url: string;
}

// 认证相关类型
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}