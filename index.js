const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config(); 

app.use(express.static('public')); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());

const cookieParser = require('cookie-parser');
app.use(cookieParser()); 

const session = require('express-session');
app.use(session({
    secret: 'your-secret', 
    resave: false,
    saveUninitialized: true
}));

const cors = require('cors');
app.use(cors()); 

const mustache = require('mustache-express');
app.engine('mustache', mustache());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

const guestbookRoutes = require('./routes/guestbookRoutes');
app.use('/', guestbookRoutes); 

app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

app.listen(process.env.PORT || 3000, () => {
    console.log('Server started. Ctrl^c to quit.');
});
