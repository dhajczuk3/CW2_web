const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userDao = require("../models/userModel");
exports.login = function (req, res) {
  console.log("auth");
  let username = req.body.username;
  let password = req.body.password;

  userDao.lookup(username, function (err, user) {
      if (err) {
          console.error("Error looking up user", err);
          return res.status(500).render("user/login", { error: "Internal server error." });
      }
      if (!user) {
          console.log("User", username, "not found");
          return res.render("user/register", { message: "No such user found; please register." });
      }
      
      // Hash the input password for comparison
      bcrypt.compare(password, user.password, function (err, result) {
          if (err) {
              console.error("Error comparing passwords", err);
              return res.status(500).render("user/login", { error: "Internal server error during password comparison." });
          }
          if (result) {
              const accessToken = jwt.sign({ username: user.username, userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
              res.cookie("jwt", accessToken, { httpOnly: true, secure: true });
              console.log("User logged in successfully");
              //res.locals.user = req.user;

              // Pass the username to the home page rendering
              res.render("home",{username: username}); // Render the home page with username
          } else {
              console.log("Invalid password for user:", username);
              return res.status(401).render("user/login", { error: "Invalid password" });
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
