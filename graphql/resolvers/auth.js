const User = require('../../models/user');
const bcrypt = require('bcryptjs');

module.exports = {
  createUser: args => {
    //check if email already exists
    return User.findOne({ email: args.input.email })
      .then(user => {
        if (user) {
          throw new Error('User exists already');
        }
        // bcrypt used to hash passwords into db. instead of saving as plain test
        return bcrypt.hash(args.input.password, 12);
      })
      .then(hashedPassword => {
        const newUser = new User({
          email: args.input.email,
          password: hashedPassword
        });
        return newUser
          .save()
          .then(res => {
            return {
              email: res.email,
              password: null,
              _id: res.id
            };
          })
          .catch(err => {
            throw err;
          });
      })
      .catch(err => {
        throw err;
      });
  }
};
