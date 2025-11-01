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
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to search products');
    }

    // Transform the data to match the expected format
    const results: Product[] = data.data.results.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      image: item.image,
      category: item.category,
      brand: item.brand,
      rating: 4.5, // Default rating
      reviews: 100, // Default reviews count
      weight: 1.0, // Default weight
      dimensions: { 
        length: 10, 
        width: 10, 
        height: 10 
      },
      basePrice: item.price || 0,
      prices: item.price ? {
        [item.retailer?.toLowerCase().replace(/\s+/g, '_') || 'default']: { 
          base: item.price, 
          stock: true 
        }
      } : {},
      links: item.url ? {
        [item.retailer?.toLowerCase().replace(/\s+/g, '_') || 'default']: item.url
      } : {}
    }));

    return {
      searchTerm: data.data.searchTerm,
      results,
      count: data.data.count,
      timestamp: data.data.timestamp
    };
  } catch (error) {
    console.error('Error searching products:', error);
    throw new Error('Failed to search products: ' + (error as Error).message);
  }
}

/**
 * Get popular search terms
 */
export async function getPopularSearches(limit: number = 10): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/popular-searches?limit=${limit}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to load popular searches');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching popular searches:', error);
    throw new Error('Failed to load popular searches: ' + (error as Error).message);
  }
}

/**
 * Get product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch product');
    }

    const item = data.data;
    
    // Transform to Product format
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      image: item.image,
      category: item.category,
      brand: item.brand,
      rating: 4.5, // Default rating
      reviews: 100, // Default reviews count
      weight: 1.0, // Default weight
      dimensions: { 
        length: 10, 
        width: 10, 
        height: 10 
      },
      basePrice: item.prices.length > 0 ? item.prices[0].price : 0,
      prices: item.prices.reduce((acc: any, price: any) => {
        acc[price.platform.toLowerCase().replace(/\s+/g, '_')] = {
          base: price.price,
          stock: price.inStock
        };
        return acc;
      }, {}),
      links: item.prices.reduce((acc: any, price: any) => {
        acc[price.platform.toLowerCase().replace(/\s+/g, '_')] = price.url;
        return acc;
      }, {}),
      priceHistory: item.prices.map((price: any) => ({
        date: price.createdAt,
        price: price.price
      }))
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    throw new Error('Failed to fetch product: ' + (error as Error).message);
  }
}

/**
 * Get user favorites
 */
export async function getUserFavorites(userId: string): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/favorites`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch favorites');
    }

    // Transform to Product format
    return data.data.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      image: item.image,
      category: item.category,
      brand: item.brand,
      rating: 4.5, // Default rating
      reviews: 100, // Default reviews count
      weight: 1.0, // Default weight
      dimensions: { 
        length: 10, 
        width: 10, 
        height: 10 
      },
      basePrice: item.price || 0,
      prices: item.price ? {
        default: { 
          base: item.price, 
          stock: true 
        }
      } : {},
      links: {}
    }));
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw new Error('Failed to fetch favorites: ' + (error as Error).message);
  }
}

/**
 * User authentication functions
 */
export async function loginUser(email: string, password: string): Promise<{ token: string; user: any }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Login failed');
    }
    
    return { token: data.token, user: data.user };
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Login failed: ' + (error as Error).message);
  }
}

export async function registerUser(email: string, password: string, name: string): Promise<{ token: string; user: any }> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name })
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Registration failed');
    }
    
    return { token: data.token, user: data.user };
  } catch (error) {
    console.error('Registration error:', error);
    throw new Error('Registration failed: ' + (error as Error).message);
  }
}

/**
 * User profile functions
 */
export async function getUserProfile(token: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch profile');
    }
    
    return data.data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw new Error('Failed to fetch profile: ' + (error as Error).message);
  }
}

export async function updateUserProfile(token: string, profileData: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData)
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to update profile');
    }
    
    return data.data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw new Error('Failed to update profile: ' + (error as Error).message);
  }
}

/**
 * User preferences functions
 */
export async function getUserPreferences(token: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/preferences`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch preferences');
    }
    
    return data.data;
  } catch (error) {
    console.error('Get preferences error:', error);
    throw new Error('Failed to fetch preferences: ' + (error as Error).message);
  }
}

export async function updateUserPreferences(token: string, preferences: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/user/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(preferences)
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to update preferences');
    }
    
    return data.data;
  } catch (error) {
    console.error('Update preferences error:', error);
    throw new Error('Failed to update preferences: ' + (error as Error).message);
  }
}

/**
 * Price alerts functions
 */
export async function getPriceAlerts(token: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch alerts');
    }
    
    return data.data;
  } catch (error) {
    console.error('Get alerts error:', error);
    throw new Error('Failed to fetch alerts: ' + (error as Error).message);
  }
}

export async function createPriceAlert(token: string, alertData: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(alertData)
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to create alert');
    }
    
    return data.data;
  } catch (error) {
    console.error('Create alert error:', error);
    throw new Error('Failed to create alert: ' + (error as Error).message);
  }
}

/**
 * Collections functions
 */
export async function getCollections(token: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/collections`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch collections');
    }
    
    return data.data;
  } catch (error) {
    console.error('Get collections error:', error);
    throw new Error('Failed to fetch collections: ' + (error as Error).message);
  }
}

export async function createCollection(token: string, collectionData: any): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(collectionData)
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to create collection');
    }
    
    return data.data;
  } catch (error) {
    console.error('Create collection error:', error);
    throw new Error('Failed to create collection: ' + (error as Error).message);
  }
}