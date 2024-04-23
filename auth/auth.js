const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userDao = require("../models/userModel");

exports.login = function (req, res, next) {
  let username = req.body.username;
  let password = req.body.password;

  userDao.lookup(username, function (err, user) {
    if (err) {
      console.log("error looking up user", err);
      return res.status(401).send('Error during user lookup');
    }
    if (!user) {
      console.log("user ", username, " not found");
      return res.render("user/register", { message: 'No such user found; please register.' });
    }
    bcrypt.compare(password, user.password, function (err, result) {
      if (result) {
        let payload = { username: username };
        let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        res.cookie("jwt", accessToken, { httpOnly: true });
        res.redirect('/dashboard');  // Assuming there's a dashboard view for logged-in users
      } else {
        return res.render("user/login", { error: 'Invalid password' });
      }
    });
  });
};

exports.verify = function (req, res, next) {
  let accessToken = req.cookies.jwt;
  if (!accessToken) {
    return res.status(403).send('No access token provided');
  }
  try {
    let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = payload; // Adding user info to request
    next();
  } catch (e) {
    res.status(401).send('Access token is invalid');
  }
};
