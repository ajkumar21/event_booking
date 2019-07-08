const Event = require('../../models/event');
const User = require('../../models/user');
const { dateToString } = require('../../helpers/date');
const DataLoader = require('dataloader');

// Dataloader is a batching mechanisms. Multiple requests (database requests) are batched together
// If 4 requests with the same ID is requested to dataloader only one request is sent and the response is sent
// to each of the 4 functions that originally made the request
// Only unique requests are made as a result, improving performance

const eventLoader = new DataLoader(eventIds => {
  return events(eventIds);
});

const userLoader = new DataLoader(userIds => {
  return User.find({ _id: { $in: userIds } });
});

// async await is another syntax for promises. can be used instead of .then
const events = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map(event => {
      return transformEvent(event);
    });
  } catch (err) {
    throw err;
  }
};

const user = async userId => {
  try {
    const user = await userLoader.load(userId.toString());

    return {
      ...user._doc,
      _id: user.id,
      createdEvents: events.bind(this, user._doc.createdEvents),
      password: null
    };
  } catch (err) {
    throw err;
  }
};

const singleEvent = async eventId => {
  try {
    //instead of making a call to mongodb again, you can use dataloader to see if the data has already been requested before - reduces number of calls
    // increased performance as a result
    const event = await eventLoader.load(eventId.toString());
    return event;
  } catch (err) {
    throw err;
  }
};

const transformBooking = booking => {
  return {
    ...booking._doc,
    user: user.bind(this, booking._doc.user),
    event: singleEvent.bind(this, booking._doc.event),
    _id: booking.id,
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt)
  };
};

const transformEvent = event => {
  return {
    ...event._doc,
    _id: event.id,
    date: dateToString(event._doc.date),
    creator: user.bind(this, event._doc.creator)
  };
};

exports.transformBooking = transformBooking;
exports.transformEvent = transformEvent;
exports.user = user;
exports.events = events;
exports.singleEvent = singleEvent;
