const express = require('express');
const router = express.Router();
const controller = require('../controllers/guestbookControllers');
const { login, verify } = require('../auth/auth');
const db = require('../models/guestbookModel');
const app = express();

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Login and User Management
router.get('/login', controller.show_login);  // uses 'user/login.mustache'
router.post('/login', login, controller.handle_login);
router.get('/register', controller.show_register_page);  // uses 'user/register.mustache'
router.post('/register', controller.post_new_user);
router.get('/contact', controller.show_contact_page);
router.get('/about', controller.show_about_page);
router.get('/addFoodItem', controller.show_addFood_page);


// Food Management
router.get('/food', verify, controller.show_available_food);  // uses 'food/foodItems.mustache'
router.post('/food', verify, controller.add_food_item);  // uses 'food/addFoodItem.mustache'
router.put('/food/:id/select', verify, controller.select_food_item);  // handles selection logic

// Entry and Posts Management
router.get('/new', verify, controller.show_new_entries);  // uses 'entries/newEntry.mustache'
router.post('/new', verify, controller.post_new_entry);
router.get('/posts/:author', controller.show_user_entries);  // uses 'entries/userEntries.mustache'

// Static Pages
router.get('/', controller.landing_page);  // uses 'home.mustache'

// Admin Dashboard
router.get('/dashboard', verify, controller.dashboard);  // uses 'admin/dashboard.mustache'

// Logout
router.get("/logout", controller.logout);

// Error Handling
router.use(function(req, res) {
    res.status(404).render('errors/404');  // uses 'errors/404.mustache'
});
router.use(function(err, req, res, next) {
    console.error(err.stack); // Log the stack trace for debugging
    res.status(500).render('errors/error', { error: err.message });  // uses 'errors/error.mustache'
});

module.exports = router;