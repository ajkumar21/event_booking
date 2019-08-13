const Booking = require('../../models/booking');
const { transformBooking, transformEvent } = require('./merge');

module.exports = {
  bookings: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthorized access');
    }

    try {
      // check user - which is an objectId stored for each booking - against loggedIn user Id stored in req
      const bookings = await Booking.find({ user: req.userId });
      return bookings.map(booking => {
        return transformBooking(booking);
      });
    } catch (err) {
      throw err;
    }
  },

  bookEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthorized access');
    }

    try {
      const user = req.userId;
      const event = args.eventId;

      const newBooking = new Booking({
        user,
        event
      });
      const result = await newBooking.save();
      return transformBooking(result);
    } catch (err) {
      throw err;
    }
  },
  cancelBooking: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthorized access');
    }

    try {
      const booking = await Booking.findById({ _id: args.bookingId }).populate(
        'event'
      );

      const event = transformEvent(booking.event);
      await Booking.deleteOne({ _id: args.bookingId });
      return event;
    } catch (err) {
      throw err;
    }
  }
};
