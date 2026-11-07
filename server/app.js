
const path = require('path');
const express = require('express');
const compression = require('compression');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const helmet = require('helmet');
const session = require('express-session');

const router = require('./router.js');

const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/DomoMaker';

mongoose.connect(dbURI).catch((err) => {
  console.error('Could not connect to MongoDB:', err);
});

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

app.use('/assets', express.static(path.resolve(__dirname, '../hosted')));

app.use(compression());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    name: 'sessionid',
    secret: process.env.SESSION_SECRET || 'domomaker-local-development-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
}));

app.engine('handlebars', expressHandlebars.engine({
  defaultLayout: false,
}));

app.set('view engine', 'handlebars');
app.set('views', path.resolve(__dirname, '../views'));

router(app);

app.listen(port, (err) => {
  if (err) {
    throw err;
  }

  console.log(`Listening on port ${port}`);
});
