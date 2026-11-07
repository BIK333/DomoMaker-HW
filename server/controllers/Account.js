
const models = require('../models');

const Account = models.Account;

const loginPage = (req, res) => res.render('login');

const signupPage = (req, res) => res.render('signup');

// Step 8 - Destroy the session when logging out
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        error: 'Unable to log out',
      });
    }

    res.clearCookie('sessionid');
    return res.redirect('/');
  });
};

// Step 10 - Create an account and start a session
const signup = async (req, res) => {
  const username = `${req.body.username || ''}`;
  const pass = `${req.body.pass || ''}`;
  const pass2 = `${req.body.pass2 || ''}`;

  if (!username || !pass || !pass2) {
    return res.status(400).json({
      error: 'All fields are required!',
    });
  }

  if (pass !== pass2) {
    return res.status(400).json({
      error: 'Passwords do not match!',
    });
  }

  try {
    const hash = await Account.generateHash(pass);

    const newAccount = new Account({
      username,
      password: hash,
    });

    await newAccount.save();

    // Save the newly created account in the session
    req.session.account = Account.toAPI(newAccount);

    return res.json({ redirect: '/maker' });
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(400).json({
        error: 'Username already in use!',
      });
    }

    return res.status(500).json({
      error: 'An error occurred!',
    });
  }
};

// Step 9 - Authenticate and start a session
const login = (req, res) => {
  const username = `${req.body.username || ''}`;
  const pass = `${req.body.pass || ''}`;

  if (!username || !pass) {
    return res.status(400).json({
      error: 'All fields are required!',
    });
  }

  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({
        error: 'Wrong username or password!',
      });
    }

    // Save the authenticated account in the session
    req.session.account = Account.toAPI(account);

    return res.json({ redirect: '/maker' });
  });
};

module.exports = {
  loginPage,
  signupPage,
  logout,
  signup,
  login,
};
