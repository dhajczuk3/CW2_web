const db = require('../models/guestbookModel');
const userDao = require("../models/userModel");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

userDao.init();

// Display the login page
exports.show_login = function(req, res) {
    res.render('user/login', { title: 'Login Page' });
};

// Handle user login
exports.handle_login = function(req, res) {
    console.log("HANDLE LOGIN");
    const { username, password } = req.body;

    // Step 1: Look up the user
    userDao.lookup(username, function (err, user) {
        if (err) {
            console.error("Error during user lookup", err);
            return res.status(500).render('user/login', { error: 'Internal server error.' });
        }
        if (!user) {
            console.log("User not found:", username);
            return res.status(401).render('user/login', { error: 'User not found. Please register.' });
        }

        // Step 2: Compare passwords
        bcrypt.compare(password, user.password, function (err, result) {
            if (err) {
                console.error("Error comparing passwords", err);
                return res.status(500).render('user/login', { error: 'Internal server error during password comparison.' });
            }
            if (result) {
                // Step 3: Generate access token
                const accessToken = jwt.sign({ username: user.username, userId: user._id }, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: "1h"
                });
                // Password matches
                console.log("User logged in successfully");
                res.cookie("jwt", accessToken, { httpOnly: true, secure: true });
                res.redirect('/'); // Redirect to the home page or dashboard
            } else {
                // Password does not match
                console.log("Invalid password for user:", username);
                return res.status(401).render('user/login', { error: 'Invalid password.' });
            }
        });
    });
};


// Display the landing page after login
exports.landing_page = function(req, res) {
    res.render('home', { title: 'Welcome to Our Service', user: res.locals.username });
     
};

// Display the registration form
exports.show_register_page = function(req, res) {
    res.render('user/register', { title: 'Register' });
};
exports.show_contact_page = function(req, res) {
    res.render('contact', { title: 'Contact Us' });
};

exports.show_about_page = function(req, res) {
    res.render('about', { title: 'About Us' });
};
exports.show_addFood_page = function(req, res) {
    res.render('food/addFoodItem', { title: 'add Food Item' });
};

// Display admin dashboard
exports.dashboard = function(req, res) {
    res.render('admin/dashboard', { title: 'Admin Dashboard' });
};


// Handle new user registration
// W kontrolerze rejestracji
exports.post_new_user = function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(400).render('user/register', { user_name_error: 'Username and password are required.' });
  }

  userDao.lookup(username, function(err, user) {
      if (err) {
          return res.status(500).render('user/register', { user_name_error: 'Failed to verify if user exists.' });
      }
      if (user) {
          return res.status(409).render('user/register', { user_name_error: 'User already exists. Please login.' });
      }
      userDao.create(username, password, function(err, newUser) {
        if (err) {
            return res.status(500).render('user/register', { user_name_error: 'Error creating user.' });
        }
        console.log("User created successfully: ", newUser);
        res.redirect('/login');
    });    
  });
};


// Logout the user
exports.logout = function(req, res) {
    req.session.destroy(() => {
        res.redirect('/login');
    });
};

// Display available food items
exports.show_available_food = function(req, res) {
    db.getAllFoodItems()
        .then((items) => {
            res.render("foodItems", {
                title: "Available Food Items",
                items: items
            });
        })
        .catch((err) => {
            console.error("Failed to fetch food items", err);
            res.status(500).send("Error loading food items.");
        });
};

// Add a new food item
exports.add_food_item = function(req, res) {
    if (!req.body.name || !req.body.expiry_date) {
        return res.status(400).send("Food name and expiry date are required.");
    }
    db.addFoodItem(req.body.name, req.body.expiry_date, req.body.quantity);
    res.redirect('/food');
};

// Select a food item by pantries
exports.select_food_item = function(req, res) {
    const itemId = req.params.id;
    db.selectFoodItem(itemId)
        .then(() => res.redirect('/food'))
        .catch((err) => {
            console.error("Failed to select food item", err);
            res.status(500).send("Error selecting food item.");
        });
};

// Display a form for creating new entries
exports.show_new_entries = function(req, res) {
    res.render('newEntry', { title: 'Add New Entry' });
};

// Display posts by a specific author
exports.show_user_entries = function(req, res) {
    const author = req.params.author;
    db.findEntriesByAuthor(author)
        .then(entries => res.render('userEntries', { entries }))
        .catch(err => res.status(500).send('Error fetching entries'));
};

// Logged in landing page
exports.loggedIn_landing = function(req, res) {
    res.render('loggedInLanding', { title: 'Welcome Back!' });
};

// Process new entries
exports.post_new_entry = function(req, res) {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).render('newEntry', {
            title: 'Add New Entry',
            error: 'Title and content cannot be empty.'
        });
    }

    db.addEntry(title, content)
        .then(() => res.redirect('/somePageToShowEntries'))
        .catch(err => {
            console.error('Error posting new entry', err);
            res.status(500).render('newEntry', {
                title: 'Add New Entry',
                error: 'Failed to post new entry.'
            });
        });
};
