# Lexipic Backend

This directory contains all backend services for the Lexipic language learning application.

## 🏗️ Structure

```
backend/
├── api/                 # Main REST API server
│   ├── src/            # TypeScript source code
│   ├── package.json    # API dependencies
│   ├── README.md       # API documentation
│   └── DEPLOYMENT.md   # Deployment guide
└── README.md           # This file
```

## 🚀 Quick Start

### 1. Set up the API Server

```bash
cd api
npm install
cp .env.example .env
```

### 2. Start MongoDB

```bash
# macOS
brew install mongodb/brew/mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt install mongodb
sudo systemctl start mongodb
```

### 3. Seed the Database

```bash
cd api
npm run seed
```

### 4. Start the Development Server

```bash
cd api
npm run dev
```

The API will be available at `http://localhost:3000`

## 📚 Services

### API Server (`/api`)

The main REST API that handles:
- User authentication and management
- Language practice questions
- Image analysis for object recognition
- Progress tracking and statistics

**Documentation:** See `api/README.md` for detailed API documentation.

**Deployment:** See `api/DEPLOYMENT.md` for production deployment guide.

## 🔗 Integration

The backend is designed to work seamlessly with the Lexipic mobile app. Update your frontend configuration to point to the API:

```typescript
// Frontend .env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## 🛠️ Development

Each service can be developed independently:

```bash
# API server
cd api && npm run dev

# Add other services as needed
```

## 📈 Future Services

This structure allows for easy addition of other backend services:

- **Worker Service** - Background job processing
- **Analytics Service** - Data analysis and reporting  
- **AI Service** - Advanced image recognition
- **Notification Service** - Push notifications
- **Cache Service** - Redis caching layer

## 🔒 Environment Variables

Each service manages its own environment configuration. See individual service README files for specific requirements.

## 🧪 Testing

```bash
# Test API health
curl http://localhost:3000/api/health

# Test API endpoints
cd api && npm test  # (when tests are added)
```

## 📝 Contributing

1. Choose the appropriate service directory
2. Follow the service-specific development guidelines
3. Ensure all services remain compatible
4. Update documentation as needed