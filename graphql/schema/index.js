const { buildSchema } = require('graphql');
//! means its not nullable - must return something even if empty.

module.exports = buildSchema(`
    
type Event {
    _id: ID!
    title: String!
    description: String!
    price: Float!
    date: String!
    creator: User!
}

input EventInput {
    title: String!
    description: String!
    price: Float!
    date: String!
}

type User {
    _id: ID!,
    email: String!
    password: String
    createdEvents: [Event!]
}

type AuthData {
    userId: ID!
    token: String!
    tokenExpiration: Int!
}

input UserInput {
    email: String!
    password: String!
}

type Booking {
    _id: ID!
    event: Event!
    user: User!
    createdAt: String!
    updatedAt: String!
}

type RootQuery {
    events: [Event!]!
    bookings: [Booking!]!
    login(email:String!, password:String!): AuthData!
}

type RootMutation {
    createEvent(input: EventInput): Event
    createUser(input: UserInput): User
    bookEvent(eventId: ID!) : Booking
    cancelBooking(bookingId: ID!): Event!
}

schema {
    query: RootQuery
    mutation: RootMutation
}
`);
