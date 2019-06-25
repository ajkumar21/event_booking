const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const mongoose = require('mongoose');
const Event = require('./models/event');
const User = require('./models/user');
const bcrypt = require('bcryptjs');

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res, next) => {
  res.send('Hello World!');
});

app.use(
  '/graphql',
  graphqlHttp({
    //! means its not nullable - must return something even if empty.
    schema: buildSchema(`
    
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
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
    `),
    rootValue: {
      events: () => {
        return Event.find()
          .then(events => {
            return events;
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
            createdEvent = res;
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
    },
    graphiql: true
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${
      process.env.MONGO_PASSWORD
    }@aj-dev-1-bpxcn.mongodb.net/${
      process.env.MONGO_DB
    }?retryWrites=true&w=majority`
  )
  .then(res => {
    app.listen(3000);
  })
  .catch(err => console.log(err));
