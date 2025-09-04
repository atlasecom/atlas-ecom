# Atlas Ecom - Professional B2B E-commerce Platform

A comprehensive, production-ready B2B e-commerce platform built with modern technologies.

## ✨ Features

### 🔐 Authentication & Security
- **User Registration/Login** with email verification
- **Google OAuth Integration** for seamless login
- **Password Reset** with email notifications
- **JWT-based Authentication** with secure token management
- **Role-based Access Control** (Admin, User, Shop Owner)

### 🛍️ E-commerce Functionality
- **Product Management** with categories, images, and inventory
- **Event Management** for special promotions and sales
- **Shop Management** with seller profiles and verification
- **Order Processing** and management system
- **Review & Rating System** for products and events

### 🎨 User Experience
- **Responsive Design** optimized for all devices
- **Multi-language Support** (English, Arabic, French)
- **Modern UI/UX** with Tailwind CSS
- **Real-time Updates** and notifications
- **Advanced Search & Filtering**

### 👨‍💼 Admin Features
- **Admin Dashboard** with analytics
- **User Management** and verification
- **Shop Approval System**
- **Content Moderation**
- **System Monitoring**

## 🚀 Tech Stack

### Frontend
- **React 18** with Hooks and Context
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Tailwind CSS** for styling
- **React Icons** for iconography
- **Framer Motion** for animations

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Passport.js** for OAuth
- **Multer** for file uploads
- **Nodemailer** for email services

### Infrastructure
- **MongoDB Atlas** for database hosting
- **Cloudinary** for image storage
- **Gmail SMTP** for email services
- **Google OAuth** for social login

## 📦 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Gmail account for email services
- Google Cloud Console account for OAuth

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/atlas-ecom.git
   cd atlas-ecom
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backendd
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up Environment Variables**
   - Copy `backendd/config.env.example` to `backendd/config.env`
   - Update the configuration with your credentials

5. **Start Development Servers**
   ```bash
   # Backend (Terminal 1)
   cd backendd
   npm start

   # Frontend (Terminal 2)
   cd frontend
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 🌐 Deployment

### 🚀 Render Deployment (Recommended)
For **Render-specific** deployment instructions, see [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

**Quick Start with Render:**
1. Run `deploy-to-render.bat` (Windows) or `deploy-to-render.sh` (Linux/Mac)
2. Follow the [Render deployment guide](./RENDER_DEPLOYMENT.md)
3. Deploy backend as Web Service
4. Deploy frontend as Static Site

### 📋 General Deployment
For other hosting platforms, see [DEPLOYMENT.md](./DEPLOYMENT.md)

### Quick Deploy Options
- **Frontend**: Render, Vercel, Netlify
- **Backend**: Render, Railway, Heroku, DigitalOcean
- **Database**: MongoDB Atlas

## 📱 Mobile Support

The platform is fully responsive and optimized for:
- 📱 Mobile devices (iOS/Android)
- 📱 Tablets
- 💻 Desktop computers
- 🖥️ Large screens

## 🔧 Configuration

### Environment Variables
See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete environment variable setup.

### Key Features Configuration
- **Email Services**: Gmail SMTP setup
- **Google OAuth**: Google Cloud Console setup
- **File Uploads**: Cloudinary integration
- **Database**: MongoDB Atlas connection

## 📊 Performance

- **Optimized Bundle Size** with code splitting
- **Lazy Loading** for better performance
- **Image Optimization** with WebP support
- **Caching Strategy** for improved speed
- **CDN Ready** for global distribution

## 🛡️ Security

- **HTTPS Enforcement** in production
- **CORS Configuration** for secure API access
- **Input Validation** and sanitization
- **Rate Limiting** to prevent abuse
- **Secure Headers** implementation

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@atlasecom.com
- 📖 Documentation: [Wiki](https://github.com/your-username/atlas-ecom/wiki)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/atlas-ecom/issues)

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB team for the database solution
- Tailwind CSS for the utility-first CSS framework
- All contributors and users of Atlas Ecom

---

**Atlas Ecom** - Building the future of B2B e-commerce 🚀