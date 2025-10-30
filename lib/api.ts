// API service for product search and price comparison
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3103/api';

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  brand: string;
  rating: number;
  reviews: number;
  weight: number;
  dimensions: { 
    length: number; 
    width: number; 
    height: number 
  };
  basePrice: number;
  prices: { 
    [platformId: string]: { 
      base: number; 
      stock: boolean 
    } 
  };
  links: { 
    [platformId: string]: string 
  };
  priceHistory?: {
    date: string;
    price: number;
  }[];
}

export interface SearchResult {
  searchTerm: string;
  results: Product[];
  count: number;
  timestamp: string;
}

export interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  brand?: string;
  country?: string;
  sortBy?: 'price' | 'rating' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Search products by term with optional filters
 */
export async function searchProducts(
  searchTerm: string, 
  filters: SearchFilters = {},
  userId?: string
): Promise<SearchResult> {
  try {
    // In a real implementation, this would call the backend API
    // For now, we'll simulate the API response
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data in the format our frontend expects
    const mockResults: Product[] = [
      {
        id: 'prod-iphone15',
        name: 'iPhone 15 Pro 256GB',
        description: 'Apple A17 Pro chip, 6.1-inch OLED display, titanium design',
        image: '/placeholder.svg?height=300&width=300&text=iPhone+15+Pro',
        category: 'Smartphones',
        brand: 'Apple',
        rating: 4.8,
        reviews: 12847,
        weight: 0.187,
        dimensions: { length: 14.7, width: 7.1, height: 0.8 },
        basePrice: 1199,
        prices: {
          amazon_us: { base: 1199, stock: true },
          walmart: { base: 1189, stock: true },
          bestbuy: { base: 1199, stock: true },
          taobao: { base: 8999, stock: true },
          jd: { base: 8799, stock: true },
        },
        links: {
          amazon_us: 'https://amazon.com/iphone15pro',
          taobao: 'https://taobao.com/item/iphone15',
          jd: 'https://jd.com/iphone15pro',
        },
        priceHistory: [
          { date: '2024-01-01', price: 1299 },
          { date: '2024-01-15', price: 1249 },
          { date: '2024-02-01', price: 1199 },
        ],
      },
      {
        id: 'prod-macbook-air',
        name: 'MacBook Air 15-inch M2',
        description: '15.3-inch Liquid Retina display, M2 chip, up to 18 hours battery life',
        image: '/placeholder.svg?height=300&width=300&text=MacBook+Air',
        category: 'Laptops',
        brand: 'Apple',
        rating: 4.9,
        reviews: 8562,
        weight: 1.51,
        dimensions: { length: 34.0, width: 23.0, height: 1.1 },
        basePrice: 1299,
        prices: {
          apple_store: { base: 1299, stock: true },
          bestbuy: { base: 1279, stock: true },
          amazon_us: { base: 1299, stock: true },
          taobao: { base: 9999, stock: true },
        },
        links: {
          apple_store: 'https://apple.com/macbook-air',
          bestbuy: 'https://bestbuy.com/macbook-air',
        },
      }
    ];

    return {
      searchTerm,
      results: mockResults,
      count: mockResults.length,
      timestamp: new Date().toISOString()
    };

    // Actual API call would look like this:
    /*
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        searchTerm,
        filters,
        userId
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
    */
  } catch (error) {
    console.error('Error searching products:', error);
    throw new Error('Failed to search products');
  }
}

/**
 * Get popular search terms
 */
export async function getPopularSearches(limit: number = 10): Promise<string[]> {
  try {
    // In a real implementation:
    /*
    const response = await fetch(`${API_BASE_URL}/popular-searches?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
    */

    // Mock data for now
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      'iPhone 15',
      'Samsung Galaxy S24',
      'MacBook Pro',
      'Nike Air Max',
      'PlayStation 5',
      'iPad Pro',
      'AirPods Pro',
      'Tesla Model 3',
      'Gaming Laptop',
      'Wireless Headphones'
    ].slice(0, limit);
  } catch (error) {
    console.error('Error fetching popular searches:', error);
    throw new Error('Failed to load popular searches');
  }
}