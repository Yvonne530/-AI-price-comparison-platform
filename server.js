const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3103;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'PriceCompare API Server',
        version: '1.0.0',
        port: PORT,
        endpoints: {
            health: '/api/health',
            search: '/api/search (POST)',
            popularSearches: '/api/popular-searches'
        }
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        port: PORT,
        message: 'Server is running successfully on port ' + PORT
    });
});

// Basic search endpoint (mock data)
app.post('/api/search', async (req, res) => {
    try {
        const { searchTerm, filters = {}, userId } = req.body;
        
        if (!searchTerm) {
            return res.status(400).json({ error: 'Search term is required' });
        }

        // Mock search results
        const mockResults = [
            {
                id: '1',
                name: `${searchTerm} - Product 1`,
                price: 29.99,
                retailer: 'Amazon',
                url: 'https://amazon.com',
                image: 'https://via.placeholder.com/200x200'
            },
            {
                id: '2',
                name: `${searchTerm} - Product 2`,
                price: 34.99,
                retailer: 'eBay',
                url: 'https://ebay.com',
                image: 'https://via.placeholder.com/200x200'
            },
            {
                id: '3',
                name: `${searchTerm} - Product 3`,
                price: 24.99,
                retailer: 'Walmart',
                url: 'https://walmart.com',
                image: 'https://via.placeholder.com/200x200'
            }
        ];

        res.json({
            success: true,
            data: {
                searchTerm,
                results: mockResults,
                count: mockResults.length,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Search API error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// Mock popular searches
app.get('/api/popular-searches', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const popularSearches = [
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
        ].slice(0, parseInt(limit));
        
        res.json({
            success: true,
            data: popularSearches
        });
    } catch (error) {
        console.error('Popular searches API error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
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
});

module.exports = app;