
require('dotenv').config();

const path = require('path');
const express = require('express');
const compression = require('compression');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const helmet = require('helmet');
const session = require('express-session');
const redis = require('redis');
const { RedisStore } = require('connect-redis');

const router = require('./router.js');

// MongoDB connection
const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/DomoMaker';

mongoose.connect(dbURI).catch((err) => {
  console.error('Could not connect to MongoDB:', err);
});

// Server port
const port = process.env.PORT || process.env.NODE_PORT || 3000;

// Redis Cloud connection
const redisClient = redis.createClient({
  url: process.env.REDISCLOUD_URL,
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

// Connect to Redis before starting the Express server
redisClient.connect().then(() => {
  console.log('Connected to Redis');

  const app = express();

  // Trust Heroku's reverse proxy
  app.set('trust proxy', 1);

  // Security middleware
  app.use(helmet());

  // Static assets
  app.use('/assets', express.static(path.resolve(__dirname, '../hosted')));

  // Compression
  app.use(compression());

  // Parse incoming form and JSON data
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Store sessions in Redis
  app.use(session({
    name: 'sessionid',
    store: new RedisStore({
      client: redisClient,
      prefix: 'domomaker:',
    }),
    secret: process.env.SESSION_SECRET || 'domomaker-local-development-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  }));

  // Handlebars configuration
  app.engine('handlebars', expressHandlebars.engine({
    defaultLayout: false,
  }));

  app.set('view engine', 'handlebars');
  app.set('views', path.resolve(__dirname, '../views'));

  // Require HTTPS when running in production
  const { requiresSecure } = require('./middleware');
  app.use(requiresSecure);

  // Register application routes
  router(app);

  // Start server
  app.listen(port, (err) => {
    if (err) {
      throw err;
    }

    console.log(`Listening on port ${port}`);
  });
}).catch((err) => {
  console.error('Failed to connect to Redis:', err);
  process.exitCode = 1;
});
