const Event = require('../../models/event');
const User = require('../../models/user');
const bcrypt = require('bcryptjs');

// async await is another syntax for promises. can be used instead of .then
const events = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map(event => {
      return {
        ...event._doc,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event._doc.creator)
      };
    });
  } catch (err) {
    throw err;
  }
};

const user = async userId => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      createdEvents: events.bind(this, user._doc.createdEvents)
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  events: () => {
    return Event.find()
      .then(events => {
        console.log(events);
        return events.map(event => {
          return {
            ...event._doc,
            date: new Date(event._doc.date).toISOString(),
            creator: user.bind(this, event._doc.creator)
          };
        });
      })
      .catch(err => {
        throw err;
      });
  },
  createEvent: args => {
    const newEvent = new Event({
      title: args.input.title,
      description: args.input.description,
      price: args.input.price,
      date: args.input.date,
      creator: '5d122973c7aade26109516d4'
    });
    let createdEvent;
    return newEvent
      .save()
      .then(res => {
        createdEvent = {
          ...res._doc,
          date: new Date(res._doc.date).toISOString(),
          creator: user.bind(this, res._doc.creator)
        };
        return User.findById('5d122973c7aade26109516d4');
      })
      .then(user => {
        user.createdEvents.push(newEvent);
        return user.save();
      })
      .then(res => {
        return createdEvent;
      })
      .catch(err => {
        throw err;
      });
  },
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
