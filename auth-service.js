const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


// Schema definition
const Schema = mongoose.Schema;

const userSchema = new Schema({
  userName: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  loginHistory: [
    {
      dateTime: { type: Date, required: true },
      userAgent: { type: String, required: true }
    }
  ]
});

let User; 

// Initialize MongoDB connection
module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    const db = mongoose.createConnection("your_mongoDB_connection_string_here", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db.on('error', (err) => reject(err));
    db.once('open', () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
};

// Register user
module.exports.registerUser = function (userData) {
  return new Promise((resolve, reject) => {
      // Check if passwords match
      if (userData.password !== userData.password2) {
          return reject("Passwords do not match");
      }

      // Hash the password before saving
      bcrypt.hash(userData.password, 10)
          .then((hash) => {
              userData.password = hash; 
              const newUser = new User(userData);
              newUser.save()
                  .then(() => resolve())
                  .catch((err) => {
                      if (err.code === 11000) {
                          reject("User Name already taken");
                      } else {
                          reject(`There was an error creating the user: ${err}`);
                      }
                  });
          })
          .catch(() => {
              reject("There was an error encrypting the password");
          });
  });
};


// Authenticate user
module.exports.checkUser = function (userData) {
  return new Promise((resolve, reject) => {
      User.findOne({ userName: userData.userName })
          .then((user) => {
              if (!user) {
                  return reject(`Unable to find user: ${userData.userName}`);
              }

              
              bcrypt.compare(userData.password, user.password)
                  .then((result) => {
                      if (!result) {
                          return reject(`Incorrect Password for user: ${userData.userName}`);
                      }

                      
                      user.loginHistory.push({
                          dateTime: new Date().toString(),
                          userAgent: userData.userAgent,
                      });

                      
                      User.updateOne(
                          { userName: user.userName },
                          { $set: { loginHistory: user.loginHistory } }
                      )
                          .then(() => resolve(user))
                          .catch((err) => {
                              reject(`There was an error verifying the user: ${err}`);
                          });
                  })
                  .catch((err) => {
                      reject(`There was an error comparing passwords: ${err}`);
                  });
          })
          .catch(() => {
              reject(`Unable to find user: ${userData.userName}`);
          });
  });
};

