const middleware = require('./middleware');
const controllers = require('./controllers');

const router = (app) => {
  // Login routes - only available when logged out
  app.get('/login', middleware.requiresLogout, controllers.Account.loginPage);
  app.post('/login', middleware.requiresLogout, controllers.Account.login);

  // Signup routes - only available when logged out
  app.get('/signup', middleware.requiresLogout, controllers.Account.signupPage);
  app.post('/signup', middleware.requiresLogout, controllers.Account.signup);

  // Logout route - only available when logged in
  app.get('/logout', middleware.requiresLogin, controllers.Account.logout);

  // Maker routes - only available when logged in
  app.get('/maker', middleware.requiresLogin, controllers.Domo.makerPage);
  app.post('/maker', middleware.requiresLogin, controllers.Domo.makeDomo);

  // Home page - only available when logged out
  app.get('/', middleware.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
