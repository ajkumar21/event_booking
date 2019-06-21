const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

const events = []; //temp solution until MONGODB set up

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
        return events;
      },
      createEvent: args => {
        const newEvent = {
          _id: Math.random().toString(),
          title: args.input.title,
          description: args.input.description,
          price: args.input.price,
          date: args.input.date
        };

        events.push(newEvent);
        return newEvent;
      }
    },
    graphiql: true
  })
);

app.listen(3000);
