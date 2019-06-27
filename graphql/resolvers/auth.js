const User = require('../../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
  createUser: args => {
    //check if email already exists
    return User.findOne({ email: args.input.email })
      .then(user => {
        if (user) {
          console.log(user);
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
  },

  login: async ({ email, password }) => {
    const user = await User.findOne({ email: email });
    console.log(email);

    console.log(user);
    if (!user) {
      throw new Error('User does not exist');
    }
    //hashed password compare
    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      throw new Error('Password is incorrect');
    }
    //jsonwebtoken generates auth token. Object to store in token, key for hashing, config object
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'somesupersecretkey',
      { expiresIn: '1h' }
    );

    return { userId: user.id, token: token, tokenExpiration: 1 };
  }
};
