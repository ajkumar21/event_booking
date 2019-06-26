const jwt = require('jsonwebtoken');

// THIS FILE IS USED TO GUARD FUNCTIONS. so it checks if a user is authorized.
// user is authorised if they have an auth header and have a verfied token supplied by server
// once decoded and verfied the isAuth header is set in the request which is then visible to all backend functions
// look at events.js and booking.js to see how to use req.isAuth for function guarding

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(' ')[1];
  if (!token || token === '') {
    req.isAuth = false;
    return next();
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, 'somesupersecretkey');
  } catch (err) {
    req.isAuth = false;
    return next();
  }

  if (!decodedToken) {
    eq.isAuth = false;
    return next();
  }

  req.isAuth = true;
  req.userId = decodedToken.userId;
  next();
};
