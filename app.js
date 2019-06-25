const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const mongoose = require('mongoose');
const Event = require('./models/event');

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

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(input: EventInput): Event
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
          date: args.input.date
        });

        return newEvent
          .save()
          .then(res => {
            console.log(res);
            return res;
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
