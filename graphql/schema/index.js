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

input UserInput {
  email: String!
  password: String!
}

type RootQuery {
    events: [Event!]!
}

type RootMutation {
    createEvent(input: EventInput): Event
    createUser(input: UserInput): User
}

schema {
    query: RootQuery
    mutation: RootMutation
}
`);
