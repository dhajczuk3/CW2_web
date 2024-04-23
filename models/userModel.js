const Datastore = require("nedb");
const bcrypt = require('bcrypt');
const saltRounds = 10;

class UserDAO {
    constructor(dbFilePath) {
        if (dbFilePath) {
            //embedded
            this.db = new Datastore({ filename: dbFilePath,
            autoload: true });
        } else {
            //in memory
            this.db = new Datastore();
        }
    }
    // for the demo the password is the bcrypt of the user name
    init() {
        this.db.insert({
            user: 'Peter',
            password:
            '$2b$10$I82WRFuGghOMjtu3LLZW9OAMrmYOlMZjEEkh.vx.K2MM05iu5hY2C'
        });
        this.db.insert({
            user: 'Ann',
            password: '$2b$10$bnEYkqZM.MhEF/LycycymOeVwkQONq8kuAUGx6G5tF9UtUcaYDs3S'
        });
        return this;
    }
    create(username, password, callback) {
        const that = this;
        bcrypt.hash(password, saltRounds).then(function(hash) {
            var entry = {
                user: username,
                password: hash,
            };
            that.db.insert(entry, function (err, newUser) {
                if (err) {
                    console.log("Can't insert user: ", username);
                    callback(err);  
                } else {
                    callback(null, newUser); 
                }
            });
        });
    }    
    lookup(username, callback) {
        this.db.find({user: username}, function(err, docs) {
            if (err) {
                return callback(err);
            }
            if (docs.length === 0) {
                return callback(null, null);
            }
            return callback(null, docs[0]);
        });
    }
}

const pathToDatabase = './userdata.db';
const dao = new UserDAO(pathToDatabase);
dao.init();

module.exports = dao;