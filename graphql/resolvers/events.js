const Event = require('../../models/event');
const { transformEvent } = require('./merge');
const User = require('../../models/user');

module.exports = {
  events: () => {
    return Event.find()
      .then(events => {
        return events.map(event => {
          return transformEvent(event);
        });
      })
      .catch(err => {
        throw err;
      });
  },

  createEvent: (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthorized access');
    }
    const newEvent = new Event({
      title: args.input.title,
      description: args.input.description,
      price: args.input.price,
      date: args.input.date,
      creator: req.userId
    });
    let createdEvent;
    return newEvent
      .save()
      .then(res => {
        createdEvent = transformEvent(res);
        return User.findById(req.userId);
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
  }
};
