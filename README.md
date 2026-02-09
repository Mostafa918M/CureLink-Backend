# cure-link

Express.js API project generated with cname-cli.
BY MOSTAFA MAHMOUD

## 🚀 Getting Started

### Install dependencies
```bash
npm install
```

### Configure environment variables
Edit the `.env` file with your configuration.

### Run the server
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

## 📁 Project Structure

```
cure-link/
├── controllers/      # Route controllers
├── services/         # Business logic
├── routes/          # API routes
├── validators/      # Request validation
├── middlewares/     # Custom middlewares
├── utils/           # Utility functions
├── config/          # Configuration files
├── logs/            # Application logs
├── app.js           # Express app setup
├── server.js        # Server entry point
└── .env             # Environment variables
```

## 🛠️ Generate Resources

Use the CLI to generate new resources:

```bash
cname g resource user
```

This will create:
- Controller with CRUD operations
- Service layer
- Routes with validation
- Validator middleware

## 📝 Available Scripts

- `npm start` - Start the server
- `npm run dev` - Start with nodemon (auto-reload)

## 🔧 Features

- ✅ Global error handling
- ✅ Request logging with Winston
- ✅ Environment-based configuration
- ✅ Standardized API responses
- ✅ Async error handling
- ✅ Health check endpoint

## 📖 API Endpoints

### Health Check
`GET /health` - Check if server is running

### Add your routes here
After generating resources, register them in `app.js`:

```javascript
app.use('/api/users', require('./routes/user.routes'));
```

## 🤝 Contributing

Feel free to contribute to this project!

## 📄 License

ISC
