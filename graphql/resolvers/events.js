const Event = require('../../models/event');
const { transformEvent } = require('./merge');

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
        createdEvent = transformEvent(res);
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
  }
};
