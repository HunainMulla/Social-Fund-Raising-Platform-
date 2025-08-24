# Social Fundraising Platform - Server

A robust backend API for the Social Fundraising Platform, built with Node.js, Express, and MongoDB. This server handles user authentication, campaign management, and payment processing.

## 🚀 Features

- **User Authentication**
  - JWT-based authentication
  - Email verification
  - Password reset functionality
  - Role-based access control

- **Campaign Management**
  - Create, read, update, and delete campaigns
  - Image upload with Cloudinary
  - Search and filter campaigns
  - Pagination and sorting

- **Payment Processing**
  - Secure payment integration
  - Transaction history
  - Webhook support for payment confirmation

- **API Documentation**
  - Comprehensive API documentation with Swagger
  - Request/response validation
  - Rate limiting and security headers

## 🛠️ Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher) or yarn
- MongoDB (v6 or higher)
- Cloudinary account (for image uploads)
- Stripe account (for payments)
- Git

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/Social_FundRaising_Server.git
cd Social_FundRaising_Server
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Create a `.env` file in the root directory with the following variables:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/social-fundraising

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Email Configuration (optional for email features)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_EMAIL=your_email@example.com
SMTP_PASSWORD=your_email_password
```

### 4. Start the development server
```bash
# Development
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:5000`

## 📚 API Documentation

Once the server is running, you can access the API documentation at:
- Swagger UI: `http://localhost:5000/api-docs`
- API JSON: `http://localhost:5000/api-docs.json`

## 🏗️ Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
├── validators/     # Request validators
└── app.js          # Express application
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🛡️ Security

- Helmet for security headers
- Rate limiting
- Data sanitization
- XSS protection
- CORS enabled
- HTTP parameter pollution protection

## 🌐 Deployment

### 1. Set up a MongoDB database
- Use MongoDB Atlas or self-hosted MongoDB
- Update the `MONGODB_URI` in your environment variables

### 2. Environment Setup
- Set all required environment variables in production
- Use a secure method to manage secrets (e.g., AWS Secrets Manager, Vercel/Netlify environment variables)

### 3. Deploy to Platform (e.g., Heroku, Render, Railway)

#### Heroku
```bash
# Login to Heroku CLI
heroku login

# Create a new Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
# ... set other environment variables

# Deploy to Heroku
git push heroku main
```

### 4. Set up a reverse proxy (Nginx)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **File Storage**: Cloudinary
- **Payments**: Stripe
- **Documentation**: Swagger/OpenAPI
- **Validation**: Joi
- **Security**: Helmet, express-rate-limit, xss-clean, hpp
- **Logging**: Winston
- **Testing**: Jest, Supertest

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- The amazing open-source community
- MongoDB, Express, and Node.js teams
- All contributors who helped build and improve this project
