# PriceCompare - Smart Shopping Tool

A responsive, modern web application for comparing product prices across multiple retailers. Built with vanilla HTML, CSS, and JavaScript, featuring a clean interface and comprehensive functionality.

## 🚀 Features

### Core Functionality
- **Smart Search**: Search for products by name, brand, or barcode
- **Voice Search**: Voice input capability (placeholder for Web Speech API integration)
- **Price Comparison**: Compare prices across multiple merchants
- **Price History**: Interactive chart showing price trends over time
- **Merchant Filtering**: Filter results by specific retailers
- **Price Range Filter**: Set minimum and maximum price limits
- **Shipping Time Filter**: Filter by delivery speed
- **Discount Filter**: Show only discounted items

### User Interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between light and dark modes
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Accessibility**: Keyboard navigation and screen reader support
- **Mobile Cards**: Card-based layout for mobile devices
- **Desktop Table**: Detailed table view for larger screens

### Interactive Elements
- **Sort Controls**: Sort by price (low to high) or merchant rating
- **Copy Links**: One-click copying of product URLs
- **Buy Now Links**: Direct links to merchant product pages
- **Hover Effects**: Interactive feedback on all clickable elements
- **Loading States**: Visual feedback during search operations

## 🛠️ Technology Stack

- **HTML5**: Semantic markup and accessibility features
- **CSS3**: Modern styling with CSS Grid, Flexbox, and CSS Variables
- **JavaScript (ES6+)**: Vanilla JavaScript with modern features
- **Chart.js**: Interactive price history charts
- **Font Awesome**: Icon library for UI elements
- **Responsive Design**: Mobile-first approach with breakpoints

## 📁 Project Structure

```
mvp_3/
├── index.html          # Main HTML file
├── styles.css          # All CSS styling and responsive design
├── script.js           # JavaScript functionality and interactions
└── README.md           # Project documentation
```

## 🎨 Design System

### Color Palette
- **Primary**: Indigo (#4f46e5) - Main brand color
- **Secondary**: Slate (#64748b) - Text and borders
- **Success**: Green (#10b981) - Positive actions and free shipping
- **Warning**: Amber (#f59e0b) - Ratings and alerts
- **Background**: Light gray (#f8fafc) / Dark slate (#0f172a)

### Typography
- **Font Family**: Segoe UI, system-ui, sans-serif
- **Headings**: Bold weights with gradient effects
- **Body Text**: Regular weight with good readability
- **Responsive**: Scales appropriately across device sizes

### Components
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Pill-shaped with hover effects
- **Inputs**: Clean borders with focus states
- **Tables**: Responsive with hover effects
- **Charts**: Interactive with smooth animations

## 🚀 Getting Started

1. **Clone or Download** the project files
2. **Open** `index.html` in a modern web browser
3. **Start Comparing** prices by entering a product name in the search bar

### Browser Requirements
- Modern browsers with ES6+ support
- Chrome 60+, Firefox 55+, Safari 12+, Edge 79+

## 📱 Responsive Breakpoints

- **Desktop**: 1024px and above - Full table layout with sidebar
- **Tablet**: 768px - 1023px - Adjusted sidebar width
- **Mobile**: Below 768px - Card-based layout, stacked components
- **Small Mobile**: Below 480px - Optimized for small screens

## 🎯 Key Features Explained

### Search Section
- Centered search bar with placeholder text
- Voice input icon for future speech recognition
- Clear call-to-action button

### Results Summary
- Dynamic title showing searched product
- Merchant count badge
- Loading states during search

### Price Comparison Table
- Merchant information with logos
- Product images and details
- Price with original price and discount badges
- Shipping costs (highlighted when free)
- Star ratings with numerical scores
- Buy now links and copy functionality

### Filters Sidebar
- Merchant selection checkboxes
- Price range slider with input fields
- Shipping time options
- Discount toggle switch

### Price History Chart
- Interactive line chart using Chart.js
- Time period selector (30 days, 90 days, 1 year)
- Responsive design that adapts to container size

### Mobile Experience
- Card-based layout for better touch interaction
- Stacked components for easier navigation
- Optimized spacing and typography
- Touch-friendly buttons and controls

## 🔧 Customization

### Adding New Merchants
1. Add merchant checkbox in the filters section
2. Include merchant data in the price table
3. Update merchant count in results summary

### Modifying Colors
Edit CSS variables in `:root` and `.dark-mode` selectors:
```css
:root {
    --accent: #your-color;
    --bg-primary: #your-background;
    /* ... other variables */
}
```

### Adding New Features
- Extend the JavaScript functionality in `script.js`
- Add new CSS classes in `styles.css`
- Update HTML structure in `index.html`

## 🌟 Future Enhancements

- **Real API Integration**: Connect to actual merchant APIs
- **User Accounts**: Save favorite products and price alerts
- **Price Alerts**: Notifications when prices drop
- **Product Reviews**: Aggregate reviews from multiple sources
- **Barcode Scanning**: Mobile camera integration
- **Advanced Filters**: Brand, category, and rating filters
- **Export Features**: Save comparison results
- **Social Sharing**: Share deals on social media

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📞 Support

For questions or support, please open an issue in the project repository.

---

**Built with ❤️ for smart shoppers everywhere** 