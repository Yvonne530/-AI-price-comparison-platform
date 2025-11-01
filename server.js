const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3103;

// CORS 配置
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://192.168.2.118:3001'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('.')); // Serve static files

// Helper function to handle async errors
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'PriceCompare API Server',
        version: '1.0.0',
        port: PORT,
        endpoints: {
            health: '/api/health',
            search: '/api/search (POST)',
            popularSearches: '/api/popular-searches',
            product: '/api/products/:id (GET)',
            favorites: '/api/users/:userId/favorites (GET)',
            auth: {
                login: '/api/auth/login (POST)',
                register: '/api/auth/register (POST)',
                forgotPassword: '/api/auth/forgot-password (POST)',
                resetPassword: '/api/auth/reset-password (POST)'
            },
            user: {
                profile: '/api/user/profile (GET, PUT)',
                preferences: '/api/user/preferences (GET, PUT)'
            },
            alerts: '/api/alerts (GET, POST)',
            collections: '/api/collections (GET, POST, PUT, DELETE)'
        }
    });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        // Test database connection
        await prisma.$queryRaw`SELECT 1`;
        res.json({ 
            success: true,
            status: 'healthy', 
            timestamp: new Date().toISOString(),
            port: PORT,
            database: 'connected',
            message: 'Server is running successfully on port ' + PORT
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            status: 'unhealthy', 
            timestamp: new Date().toISOString(),
            port: PORT,
            database: 'disconnected',
            error: error.message,
            message: 'Server is running but database is not connected'
        });
    }
});

// Authentication endpoints
// POST /api/auth/login
app.post('/api/auth/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Email and password are required'
        });
    }

    // In a real implementation, you would:
    // 1. Find user by email
    // 2. Verify password hash
    // 3. Generate JWT token
    // 4. Return user data and token
    
    // For now, we'll simulate a successful login
    const user = await prisma.user.findUnique({
        where: { email }
    });
    
    if (!user) {
        return res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }
    
    // Simulate token generation
    const token = 'simulated-jwt-token-' + user.id;
    
    res.json({
        success: true,
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar
        }
    });
}));

// POST /api/auth/register
app.post('/api/auth/register', asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
        return res.status(400).json({
            success: false,
            error: 'Email, password, and name are required'
        });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });
    
    if (existingUser) {
        return res.status(400).json({
            success: false,
            error: 'User with this email already exists'
        });
    }
    
    // Create new user
    const user = await prisma.user.create({
        data: {
            email,
            name,
            password: 'hashed-' + password // In real app, hash the password
        }
    });
    
    // Simulate token generation
    const token = 'simulated-jwt-token-' + user.id;
    
    res.status(201).json({
        success: true,
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar
        }
    });
}));

// POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({
            success: false,
            error: 'Email is required'
        });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { email }
    });
    
    if (!user) {
        // Return success even if user doesn't exist (security best practice)
        return res.json({
            success: true,
            message: 'If an account exists with this email, you will receive password reset instructions'
        });
    }
    
    // In a real implementation, you would:
    // 1. Generate a secure reset token
    // 2. Save it to the database with expiration
    // 3. Send email with reset link
    
    res.json({
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions'
    });
}));

// POST /api/auth/reset-password
app.post('/api/auth/reset-password', asyncHandler(async (req, res) => {
    const { token, password } = req.body;
    
    if (!token || !password) {
        return res.status(400).json({
            success: false,
            error: 'Token and password are required'
        });
    }

    // In a real implementation, you would:
    // 1. Verify the token
    // 2. Check if token is expired
    // 3. Update user's password
    // 4. Invalidate the token
    
    res.json({
        success: true,
        message: 'Password has been reset successfully'
    });
}));

// User profile endpoints
// GET /api/user/profile
app.get('/api/user/profile', asyncHandler(async (req, res) => {
    // In a real implementation, you would:
    // 1. Verify JWT token from Authorization header
    // 2. Extract user ID from token
    // 3. Fetch user data from database
    
    // For now, we'll simulate with a mock user
    const user = {
        id: 'user123',
        email: 'user@example.com',
        name: 'Test User',
        avatar: null,
        createdAt: new Date().toISOString()
    };
    
    res.json({
        success: true,
        data: user
    });
}));

// PUT /api/user/profile
app.put('/api/user/profile', asyncHandler(async (req, res) => {
    const { name, avatar } = req.body;
    
    // In a real implementation, you would:
    // 1. Verify JWT token
    // 2. Extract user ID from token
    // 3. Update user data in database
    
    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
            name,
            avatar
        }
    });
}));

// User preferences endpoints
// GET /api/user/preferences
app.get('/api/user/preferences', asyncHandler(async (req, res) => {
    // In a real implementation, you would:
    // 1. Verify JWT token
    // 2. Extract user ID from token
    // 3. Fetch user preferences from database
    
    // For now, return default preferences
    const preferences = {
        defaultCurrency: 'CNY',
        defaultCountry: 'CN',
        defaultLanguage: 'zh-CN',
        theme: 'system',
        emailNotifications: true,
        pushNotifications: true
    };
    
    res.json({
        success: true,
        data: preferences
    });
}));

// PUT /api/user/preferences
app.put('/api/user/preferences', asyncHandler(async (req, res) => {
    const preferences = req.body;
    
    // In a real implementation, you would:
    // 1. Verify JWT token
    // 2. Extract user ID from token
    // 3. Update user preferences in database
    
    res.json({
        success: true,
        message: 'Preferences updated successfully',
        data: preferences
    });
}));

// Basic search endpoint
app.post('/api/search', asyncHandler(async (req, res) => {
    const { searchTerm, filters = {}, userId } = req.body;
    
    if (!searchTerm) {
        return res.status(400).json({ 
            success: false,
            error: 'Search term is required' 
        });
    }

    // Search products in database
    const products = await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
                { brand: { contains: searchTerm, mode: 'insensitive' } },
                { category: { contains: searchTerm, mode: 'insensitive' } }
            ]
        },
        include: {
            prices: {
                orderBy: {
                    createdAt: 'desc'
                },
                take: 1
            }
        },
        take: 20
    });

    // Format results
    const results = products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        image: product.image || '/placeholder.svg?height=200&width=200',
        category: product.category,
        brand: product.brand || '',
        price: product.prices.length > 0 ? product.prices[0].price : null,
        currency: product.prices.length > 0 ? product.prices[0].currency : 'CNY',
        retailer: product.prices.length > 0 ? product.prices[0].platform : '',
        url: product.prices.length > 0 ? product.prices[0].url : ''
    }));

    res.json({
        success: true,
        data: {
            searchTerm,
            results,
            count: results.length,
            timestamp: new Date().toISOString()
        }
    });
}));

// Popular searches endpoint
app.get('/api/popular-searches', asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;
    
    // Get popular searches from database
    const popularSearches = await prisma.search.groupBy({
        by: ['query'],
        _count: {
            query: true
        },
        orderBy: {
            _count: {
                query: 'desc'
            }
        },
        take: parseInt(limit)
    });

    const searches = popularSearches.map(search => search.query);
    
    res.json({
        success: true,
        data: searches
    });
}));

// Get product by ID
app.get('/api/products/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            prices: {
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    });

    if (!product) {
        return res.status(404).json({
            success: false,
            error: 'Product not found'
        });
    }

    // Format product data
    const formattedProduct = {
        id: product.id,
        name: product.name,
        description: product.description || '',
        image: product.image || '/placeholder.svg?height=300&width=300',
        category: product.category,
        brand: product.brand || '',
        prices: product.prices.map(price => ({
            id: price.id,
            price: price.price,
            currency: price.currency,
            platform: price.platform,
            url: price.url,
            inStock: price.inStock,
            createdAt: price.createdAt
        }))
    };

    res.json({
        success: true,
        data: formattedProduct
    });
}));

// Get user favorites
app.get('/api/users/:userId/favorites', asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    // Get user's favorite products
    const favorites = await prisma.product.findMany({
        where: {
            favoriteUsers: {
                some: {
                    id: userId
                }
            }
        },
        include: {
            prices: {
                orderBy: {
                    createdAt: 'desc'
                },
                take: 1
            }
        }
    });

    // Format favorites
    const formattedFavorites = favorites.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        image: product.image || '/placeholder.svg?height=200&width=200',
        category: product.category,
        brand: product.brand || '',
        price: product.prices.length > 0 ? product.prices[0].price : null,
        currency: product.prices.length > 0 ? product.prices[0].currency : 'CNY'
    }));

    res.json({
        success: true,
        data: formattedFavorites
    });
}));

// Create a new user
app.post('/api/users', asyncHandler(async (req, res) => {
    const { email, name } = req.body;
    
    if (!email || !name) {
        return res.status(400).json({
            success: false,
            error: 'Email and name are required'
        });
    }

    const user = await prisma.user.create({
        data: {
            email,
            name,
            password: 'placeholder_password' // In a real app, this would be hashed
        }
    });

    res.status(201).json({
        success: true,
        data: {
            id: user.id,
            email: user.email,
            name: user.name
        }
    });
}));

// Add product to favorites
app.post('/api/users/:userId/favorites/:productId', asyncHandler(async (req, res) => {
    const { userId, productId } = req.params;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
        where: { id: productId }
    });

    if (!product) {
        return res.status(404).json({
            success: false,
            error: 'Product not found'
        });
    }

    // Add to favorites (this will create the relationship)
    await prisma.user.update({
        where: { id: userId },
        data: {
            favorites: {
                connect: { id: productId }
            }
        }
    });

    res.json({
        success: true,
        message: 'Product added to favorites'
    });
}));

// Price alerts endpoints
// GET /api/alerts
app.get('/api/alerts', asyncHandler(async (req, res) => {
    // In a real implementation, you would:
    // 1. Verify JWT token
    // 2. Extract user ID from token
    // 3. Fetch user's price alerts from database
    
    // For now, return mock data
    const alerts = [
        {
            id: 'alert1',
            productId: 'product1',
            productName: 'iPhone 15 Pro',
            thresholdPrice: 1000,
            currentPrice: 1199,
            currency: 'USD',
            status: 'active',
            createdAt: new Date().toISOString()
        }
    ];
    
    res.json({
        success: true,
        data: alerts
    });
}));

// POST /api/alerts
app.post('/api/alerts', asyncHandler(async (req, res) => {
    const { productId, thresholdPrice } = req.body;
    
    // In a real implementation, you would:
    // 1. Verify JWT token
    // 2. Extract user ID from token
    // 3. Create price alert in database
    
    res.json({
        success: true,
        message: 'Price alert created successfully',
        data: {
            id: 'new-alert-id',
            productId,
            thresholdPrice
        }
    });
}));

// Collections endpoints
// GET /api/collections
app.get('/api/collections', asyncHandler(async (req, res) => {
    // In a real implementation, you would:
    // 1. Verify JWT token
    // 2. Extract user ID from token
    // 3. Fetch user's collections from database
    
    // For now, return mock data
    const collections = [
        {
            id: 'collection1',
            name: 'Wishlist',
            description: 'Products I want to buy',
            productCount: 5,
            createdAt: new Date().toISOString()
        }
    ];
    
    res.json({
        success: true,
        data: collections
    });
}));

// POST /api/collections
app.post('/api/collections', asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    
    // In a real implementation, you would:
    // 1. Verify JWT token
    // 2. Extract user ID from token
    // 3. Create collection in database
    
    res.json({
        success: true,
        message: 'Collection created successfully',
        data: {
            id: 'new-collection-id',
            name,
            description
        }
    });
}));

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'The requested resource was not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 PriceCompare API server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔍 Search API: POST http://localhost:${PORT}/api/search`);
    console.log(`🔥 Popular searches: GET http://localhost:${PORT}/api/popular-searches`);
    console.log(`📦 Product details: GET http://localhost:${PORT}/api/products/:id`);
    console.log(`❤️  User favorites: GET http://localhost:${PORT}/api/users/:userId/favorites`);
    console.log(`👤 Create user: POST http://localhost:${PORT}/api/users`);
    console.log(`➕ Add to favorites: POST http://localhost:${PORT}/api/users/:userId/favorites/:productId`);
    console.log(`🔐 Authentication:`);
    console.log(`   Login: POST http://localhost:${PORT}/api/auth/login`);
    console.log(`   Register: POST http://localhost:${PORT}/api/auth/register`);
    console.log(`   Forgot Password: POST http://localhost:${PORT}/api/auth/forgot-password`);
    console.log(`   Reset Password: POST http://localhost:${PORT}/api/auth/reset-password`);
    console.log(`👤 User:`);
    console.log(`   Profile: GET/PUT http://localhost:${PORT}/api/user/profile`);
    console.log(`   Preferences: GET/PUT http://localhost:${PORT}/api/user/preferences`);
    console.log(`🔔 Alerts: GET/POST http://localhost:${PORT}/api/alerts`);
    console.log(`📂 Collections: GET/POST http://localhost:${PORT}/api/collections`);
});

module.exports = app;