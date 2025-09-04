# 🚀 Atlas Ecom Backend - MongoDB Integrated

A robust, scalable backend for the Atlas E-commerce B2B platform built with Node.js, Express, and MongoDB.

## ✨ Features

- **🔐 Authentication & Authorization**: JWT-based auth with role-based access control
- **🏪 Shop Management**: Complete shop creation and management system
- **📦 Product Management**: Full CRUD operations for products with image uploads
- **🎉 Event System**: Promotional events and flash sales management
- **💬 Chat System**: Real-time messaging between users and sellers
- **💰 Order Management**: Complete order lifecycle management
- **🎫 Coupon System**: Discount codes and promotional offers
- **💳 Payment Integration**: Ready for Stripe, PayPal, and other payment gateways
- **📊 Admin Dashboard**: Comprehensive admin panel for system management
- **🖼️ File Uploads**: Image uploads for products, shops, and events
- **🔍 Search & Filtering**: Advanced search with MongoDB text indexes
- **📱 API Documentation**: RESTful API with comprehensive endpoints

## 🛠️ Tech Stack

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **File Uploads**: Multer with file validation
- **Validation**: Express-validator
- **Security**: Helmet, CORS, rate limiting
- **Compression**: Gzip compression for better performance

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the environment configuration file:

```bash
cp config.env .env
```

Update the `.env` file with your configuration:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/atlas_ecom
MONGODB_URI_BACKUP=mongodb://localhost:27017/atlas_ecom_backup

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Server Configuration
PORT=5000
NODE_ENV=development

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Security Configuration
BCRYPT_SALT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod
```

### 4. Seed the Database (Optional)

Populate the database with initial test data:

```bash
node scripts/seedDatabase.js
```

This will create:
- Admin user: `admin@atlasecom.com` / `Admin@123`
- Seller user: `seller@atlasecom.com` / `Seller@123`
- Customer user: `customer@atlasecom.com` / `Customer@123`
- Sample shop, products, and events

### 5. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Shops
- `POST /api/shops` - Create shop (Seller only)
- `GET /api/shops` - Get all shops
- `GET /api/shops/:id` - Get shop by ID
- `PUT /api/shops/:id` - Update shop
- `GET /api/shops/:id/products` - Get shop products
- `GET /api/shops/:id/events` - Get shop events

### Products
- `POST /api/products/:shopId` - Create product (Shop owner only)
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/:id/reviews` - Add product review

### Admin
- `GET /admin/sellers` - Get all sellers
- `POST /admin/sellers/:id/approve` - Approve seller
- `POST /admin/sellers/:id/reject` - Reject seller

### Legacy Endpoints (Backward Compatibility)
- `GET /products` - Get products (frontend format)
- `GET /api/v2/products` - Get products (API format)
- `GET /api/v2/events` - Get events
- `GET /api/v2/shops` - Get shops

## 🗄️ Database Models

### User
- Basic info (name, email, password, phone, address)
- Role-based access (user, seller, admin)
- Shop reference for sellers
- OAuth support for future integration

### Shop
- Shop information (name, description, address, contact)
- Owner reference
- Banner images
- Withdrawal methods and balance
- Approval status

### Product
- Product details (name, description, category, tags)
- Pricing (original and discount prices)
- Inventory management (stock, sold count)
- Image galleries
- Reviews and ratings
- Shop reference

### Event
- Event information (name, description, dates)
- Promotional pricing
- Status tracking (upcoming, running, ended)
- Shop association

### Order
- Cart items with quantities
- Shipping address
- Payment information
- Status tracking
- User association

### Conversation & Message
- Chat system for user-seller communication
- Group chat support
- Message history

## 🔐 Authentication & Authorization

### JWT Tokens
- Secure token-based authentication
- Configurable expiration times
- Automatic token refresh mechanism

### Role-Based Access Control
- **User**: Browse products, place orders, chat with sellers
- **Seller**: Manage shop, products, events, orders
- **Admin**: Full system access, approve sellers, manage users

### Protected Routes
- Use `protect` middleware for authenticated routes
- Use `authorize` middleware for role-specific routes
- Use `checkOwnership` middleware for resource ownership

## 🖼️ File Uploads

### Supported Formats
- Images: JPEG, JPG, PNG, GIF, WebP
- Maximum file size: 10MB
- Automatic file validation and sanitization

### Upload Paths
- Products: `./uploads/products/`
- Shops: `./uploads/shops/`
- Events: `./uploads/events/`

## 🚀 Performance Features

### Database Optimization
- Strategic indexing on frequently queried fields
- Text search indexes for product and event search
- Connection pooling for better performance

### API Optimization
- Response compression (Gzip)
- Pagination for large datasets
- Efficient data population and filtering

## 🛡️ Security Features

### Input Validation
- Comprehensive request validation using express-validator
- SQL injection protection through Mongoose
- XSS protection headers

### Rate Limiting
- Configurable rate limiting per IP
- Request throttling to prevent abuse

### Security Headers
- Helmet.js for security headers
- CORS configuration
- Content Security Policy

## 🧪 Testing

### Manual Testing
Test the API endpoints using tools like:
- Postman
- Insomnia
- Thunder Client (VS Code extension)

### Test Accounts
After seeding the database:
- **Admin**: `admin@atlasecom.com` / `Admin@123`
- **Seller**: `seller@atlasecom.com` / `Seller@123`
- **Customer**: `customer@atlasecom.com` / `Customer@123`

## 📁 Project Structure

```
backendd/
├── config/
│   └── database.js          # Database connection
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── errorHandler.js      # Error handling middleware
├── models/
│   ├── User.js              # User model
│   ├── Shop.js              # Shop model
│   ├── Product.js           # Product model
│   ├── Event.js             # Event model
│   ├── Order.js             # Order model
│   ├── Conversation.js      # Conversation model
│   ├── Message.js           # Message model
│   ├── Coupon.js            # Coupon model
│   └── Withdraw.js          # Withdraw model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── shops.js             # Shop routes
│   └── products.js          # Product routes
├── scripts/
│   └── seedDatabase.js      # Database seeding script
├── uploads/                 # File uploads directory
├── config.env               # Environment configuration
├── package.json             # Dependencies
├── server.js                # Main server file
└── README.md                # This file
```

## 🔧 Configuration Options

### Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRE`: JWT token expiration time
- `PORT`: Server port number
- `NODE_ENV`: Environment (development/production)
- `MAX_FILE_SIZE`: Maximum file upload size
- `BCRYPT_SALT_ROUNDS`: Password hashing rounds

### Database Configuration
- Connection pooling
- Timeout settings
- Index optimization
- Backup configuration

## 🚀 Deployment

### Production Considerations
1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure MongoDB with authentication
4. Set up proper CORS origins
5. Configure rate limiting
6. Set up monitoring and logging
7. Use HTTPS in production

### Docker Support
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Check the API documentation
- Review the error logs
- Test with the provided test accounts
- Ensure MongoDB is running and accessible

## 📄 License

This project is licensed under the MIT License.

---

**🎉 Your Atlas Ecom backend is now ready with full MongoDB integration!**

