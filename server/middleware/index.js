const requiresLogin = (req, res, next) => {
    if (!req.session || !req.session.account) {
      return res.redirect('/');
    }
  
    return next();
};
  
const requiresLogout = (req, res, next) => {
    if (req.session && req.session.account) {
      return res.redirect('/maker');
    }
  
    return next();
};
  
const requiresSecure = (req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
      return next();
    }
  
    if (!req.secure) {
      return res.redirect(301, `https://${req.get('host')}${req.originalUrl}`);
    }
  
    return next();
};
  
module.exports = {
    requiresLogin,
    requiresLogout,
    requiresSecure,
};
  