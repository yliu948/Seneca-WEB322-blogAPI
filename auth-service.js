var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

var userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
  },
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});
let User; // to be defined on new connection (see initialize)

module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection(
      "mongodb+srv://yliu620:Myxq0908@web422.k6hqfk9.mongodb.net?retryWrites=true&w=majority"
    );
    db.on("error", (err) => {
      reject(err); // reject the promise with the provided error
    });
    db.once("open", () => {
      console.log("MongoDB Sync Completed");
      User = db.model("users", userSchema);
      resolve();
    });
  });
};

module.exports.registerUser = function (userData) {
  return new Promise((resolve, reject) => {
    if (userData.password != userData.password2) {
      reject("Password do not match");
    } else {
      //   let newUser = new User(userData);
      //   newUser
      //     .save()
      //     .then(() => {
      //       resolve();
      //     })
      //     .catch((err) => {
      //       if (err.code == 11000) {
      //         reject("USERNAME IS TAKEN");
      //       } else {
      //         reject("There was an error creating the user: " + err);
      //       }
      //     });
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          reject("There was an error encrypting the password");
        } else {
          bcrypt.hash(userData.password, salt, function (err, hash) {
            if (err) {
              reject("There was an error encrypting the password");
            } else {
              userData.password = hash;
              let newUser = new User(userData);
              newUser
                .save()
                .then(() => {
                  resolve();
                })
                .catch((err) => {
                  if (err.code == 11000) {
                    reject("USERNAME IS TAKEN");
                  } else {
                    reject("There was an error creating the user: " + err);
                  }
                });
            }
          });
        }
      });
    }
  });
};

module.exports.checkUser = function (userData) {
  return new Promise((resolve, reject) => {
    User.find({ userName: userData.userName })
      .exec()
      .then((users) => {
        if (users.length == 0) {
          reject("Unable to find user: " + userData.userName);
        }
        // } else if (users[0].password != userData.password) {
        //   reject("Incorrect Password for user: " + userData.userName);
        // } else if (users[0].password == userData.password) {
        //   users[0].loginHistory.push({
        //     dateTime: new Date().toString(),
        //     userAgent: userData.userAgent,
        //   });
        //   User.update(
        //     { userName: users[0].userName },
        //     { $set: { loginHistory: users[0].loginHistory } },
        //     { multi: false }
        //   )
        //     .exec()
        //     .then(() => {
        //       resolve(users[0]);
        //     })
        //     .catch((err) => {
        //       reject("There was an error verifying the user: " + err);
        //     });
        //}
        else {
          bcrypt
            .compare(userData.password, users[0].password)
            .then((isMatch) => {
              if (isMatch == true) {
                users[0].loginHistory.push({
                  dateTime: new Date().toString(),
                  userAgent: userData.userAgent,
                });
                User.update(
                  { userName: users[0].userName },
                  { $set: { loginHistory: users[0].loginHistory } },
                  { multi: false }
                )
                  .exec()
                  .then(() => {
                    resolve(users[0]);
                  })
                  .catch((err) => {
                    reject("There was an error verifying the user: " + err);
                  });
              } else {
                reject("Incorrect Password for user: " + userData.userName);
              }
            })
            .catch(() => {
              reject("Unable to find user: " + userData.userName);
            });
        }
      })
      .catch(() => {
        reject("Unable to find user: " + userData.userName);
      });
  });
};
