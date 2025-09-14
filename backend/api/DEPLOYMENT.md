# Lexipic Backend Deployment Guide

## 🚀 Quick Start

### Local Development Setup

1. **Prerequisites**
   ```bash
   # Install Node.js 16+ and MongoDB
   brew install node mongodb/brew/mongodb-community
   brew services start mongodb-community
   ```

2. **Install and Run**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run seed     # Populate database with sample questions
   npm run dev      # Start development server
   ```

3. **Test API**
   ```bash
   curl http://localhost:3000/api/health
   ```

## 🌐 Production Deployment

### Option 1: Traditional VPS/Server

1. **Server Setup**
   ```bash
   # On Ubuntu/Debian
   sudo apt update
   sudo apt install nodejs npm mongodb
   
   # Install PM2 for process management
   npm install -g pm2
   ```

2. **Deploy Application**
   ```bash
   git clone <your-repo>
   cd lexipic/backend
   npm install --production
   npm run build
   
   # Set production environment variables
   export NODE_ENV=production
   export MONGODB_URI="mongodb://localhost:27017/lexipic"
   export JWT_SECRET="your-production-jwt-secret"
   export CORS_ORIGIN="https://your-app-domain.com"
   
   # Seed database (first time only)
   npm run seed
   
   # Start with PM2
   pm2 start dist/server.js --name "lexipic-api"
   pm2 startup
   pm2 save
   ```

### Option 2: Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY dist ./dist
   EXPOSE 3000
   CMD ["node", "dist/server.js"]
   ```

2. **Docker Compose**
   ```yaml
   version: '3.8'
   services:
     api:
       build: .
       ports:
         - "3000:3000"
       environment:
         - MONGODB_URI=mongodb://mongo:27017/lexipic
       depends_on:
         - mongo
     
     mongo:
       image: mongo:6
       volumes:
         - mongodb_data:/data/db
   
   volumes:
     mongodb_data:
   ```

### Option 3: Cloud Platforms

#### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Create Heroku app
heroku create lexipic-api
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-jwt-secret

# Deploy
git push heroku main
heroku run npm run seed
```

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

#### DigitalOcean App Platform
- Connect your GitHub repository
- Set build command: `npm run build`
- Set run command: `npm start`
- Add MongoDB database component

## 🗄️ Database Setup

### MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create cluster and get connection string
3. Update MONGODB_URI in environment variables
4. Whitelist your server IP or use 0.0.0.0/0 for all IPs

### Local MongoDB
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt install mongodb
sudo systemctl start mongodb

# Verify installation
mongo --eval 'db.runCommand({ connectionStatus: 1 })'
```

## 🔧 Environment Variables

### Required Variables
```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
CORS_ORIGIN=https://your-frontend-domain.com
```

### Optional Variables
```bash
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=10MB
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# AI Services (optional)
OPENAI_API_KEY=your-openai-key
GOOGLE_VISION_API_KEY=your-google-vision-key
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# API Health
curl https://your-api-domain.com/api/health

# Database Health
curl https://your-api-domain.com/api/questions/random
```

### Logging
```bash
# PM2 Logs
pm2 logs lexipic-api

# Docker Logs
docker-compose logs -f api
```

### Database Maintenance
```bash
# Backup
mongodump --uri="mongodb://localhost:27017/lexipic" --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://localhost:27017/lexipic" /backup/20231215/lexipic

# Re-seed database
npm run seed
```

## 🔒 Security Checklist

- [ ] Use HTTPS in production
- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] Configure CORS_ORIGIN to your domain
- [ ] Enable MongoDB authentication
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Monitor error logs
- [ ] Set up rate limiting
- [ ] Validate file uploads

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check if MongoDB is running
   sudo systemctl status mongodb
   
   # Check connection string
   echo $MONGODB_URI
   ```

2. **JWT Secret Missing**
   ```bash
   # Make sure JWT_SECRET is set
   echo $JWT_SECRET
   ```

3. **CORS Issues**
   ```bash
   # Update CORS_ORIGIN to match your frontend URL
   export CORS_ORIGIN=https://your-app.com
   ```

4. **File Upload Issues**
   ```bash
   # Check uploads directory exists and has write permissions
   mkdir -p uploads
   chmod 755 uploads
   ```

### Performance Optimization

1. **Database Indexes**
   ```javascript
   // Add these indexes in MongoDB
   db.users.createIndex({ email: 1 })
   db.questions.createIndex({ language: 1, category: 1 })
   db.useranswers.createIndex({ userId: 1, answeredAt: -1 })
   ```

2. **Caching**
   - Add Redis for session storage
   - Cache frequent database queries
   - Use CDN for image uploads

3. **Load Balancing**
   - Use nginx for reverse proxy
   - Scale horizontally with multiple instances

## 📈 Scaling Considerations

### High Traffic
- Use Redis for session management
- Implement database connection pooling
- Add caching layer (Redis/Memcached)
- Use CDN for static assets

### Global Distribution
- Multiple database replicas
- Region-based deployment
- Image CDN (AWS CloudFront, etc.)

## 🔧 Development vs Production

### Development
```bash
npm run dev      # Hot reload with nodemon
npm run seed     # Reset database with sample data
```

### Production
```bash
npm run build    # Compile TypeScript
npm start        # Run compiled JavaScript
pm2 start dist/server.js  # Production process manager
```
