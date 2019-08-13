import React, { Component } from 'react';
import AuthContext from '../context/auth-context';
import { Button, Icon, Header, Modal, Form, Card } from 'semantic-ui-react';
class EventsPage extends Component {
  isActive = true;

  constructor(props) {
    super(props);
    this.titleElReft = React.createRef();
    this.priceElReft = React.createRef();
    this.dateElReft = React.createRef();
    this.descriptionElReft = React.createRef();
    this.state = {
      creating: false,
      events: [],
      isLoading: false,
      selectedEvent: null,
      open: false
    };
  }
  componentDidMount() {
    this.fetchEvents();
  }
  createEventHandler = () => {
    this.setState({ creating: true });
  };

  // provides access to authcontext for use in functions.
  //To use within render, you need authcontext.consumer like in navigation component
  static contextType = AuthContext;

  modalCancel = () => {
    this.setState({ creating: false, selectedEvent: null, open: false });
  };

  modalConfirm = () => {
    this.setState({ creating: false, open: false });
    const title = this.titleElReft.current.value;
    const price = +this.priceElReft.current.value;
    // adding + to variable name makes it a number
    const date = this.dateElReft.current.value;
    const description = this.descriptionElReft.current.value;
    if (
      title.trim().length === 0 ||
      price <= 0 ||
      date.trim().length === 0 ||
      description.trim().length === 0
    ) {
      return;
    }

    const requestBody = {
      query: `
      mutation {
        createEvent(input:{title:"${title}", description:"${description}", price:${price},date:"${date}"}){
        _id
        title
        description
        date
        price
      }
    }`
    };

    const token = this.context.token;

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'content-type': 'application/json',
        Authorization: 'Bearer ' + token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed');
        }
        return res.json();
      })
      .then(resData => {
        this.setState(prevState => {
          const updatedEvents = [...prevState.events];
          updatedEvents.push({
            _id: resData.data.createEvent._id,
            title: resData.data.createEvent.title,
            description: resData.data.createEvent.description,
            date: resData.data.createEvent.date,
            price: resData.data.createEvent.price,
            creator: {
              _id: this.context._id
            }
          });
          return { events: updatedEvents };
        });
      })
      .catch(err => console.log(err));
  };

  fetchEvents() {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
      query {
        events {
          _id
          title
          description
          date
          price
          creator{
            _id
            email
          }
        }
    }`
    };

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'content-type': 'application/json'
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed');
        }
        return res.json();
      })
      .then(resData => {
        const events = resData.data.events;
        if (this.isActive) {
          this.setState({ events: events, isLoading: false });
        }
      })
      .catch(err => {
        console.log(err);
        if (this.isActive) {
          this.setState({ isLoading: false });
        }
      });
  }

  showDetailHandler = eventId => {
    this.setState(prevState => {
      const selectedEvent = prevState.events.find(e => e._id === eventId);
      return { selectedEvent: selectedEvent };
    });
  };

  bookEventHandler = id => {
    if (!this.context.token) {
      this.setState({ selectedEvent: null });
      return;
    }
    const requestBody = {
      query: `
      mutation {
        bookEvent(eventId: "${id}") {
          _id
          createdAt
          updatedAt
        }
    }`
    };

    const token = this.context.token;

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'content-type': 'application/json',
        Authorization: 'Bearer ' + token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          console.log(res);
          throw new Error('Failed');
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
        this.setState({ selectedEvent: null });
      })
      .catch(err => {
        console.log(err);
      });
  };

  componentWillUnmount() {
    this.isActive = false;
  }

  render() {
    return (
      <React.Fragment>
        <div>
          <Header as='h2' icon textAlign='center'>
            <Icon name='calendar alternate' circular />
            <Header.Content>Events</Header.Content>
          </Header>
          <br />
        </div>
        {this.context.token && (
          <Modal
            trigger={
              <React.Fragment>
                <Button
                  animated
                  color='green'
                  onClick={() => this.setState({ open: true })}
                >
                  <Button.Content visible>Add Event</Button.Content>
                  <Button.Content hidden>
                    <Icon name='add circle' />
                  </Button.Content>
                </Button>
                <br />
                <br />
                <br />
              </React.Fragment>
            }
            basic
            size='small'
            open={this.state.open}
          >
            <Header icon='archive' content='New Event' />
            <Modal.Content>
              <Form>
                <Form.Field>
                  <label htmlFor='title' style={{ color: 'white' }}>
                    Title
                  </label>
                  <input ref={this.titleElReft} />
                </Form.Field>
                <Form.Field>
                  <label htmlFor='price' style={{ color: 'white' }}>
                    Price
                  </label>
                  <input type='number' id='price' ref={this.priceElReft} />
                </Form.Field>

                <Form.Field>
                  <label htmlFor='date' style={{ color: 'white' }}>
                    Date
                  </label>
                  <input type='date' id='date' ref={this.dateElReft} />
                </Form.Field>
                <Form.Field>
                  <label htmlFor='description' style={{ color: 'white' }}>
                    Description
                  </label>
                  <textarea
                    rows='4'
                    id='description'
                    ref={this.descriptionElReft}
                  />
                </Form.Field>
              </Form>
            </Modal.Content>
            <Modal.Actions>
              <Button basic color='red' inverted onClick={this.modalCancel}>
                <Icon name='remove' /> Cancel
              </Button>
              <Button color='green' inverted onClick={this.modalConfirm}>
                <Icon name='checkmark' /> Create
              </Button>
            </Modal.Actions>
          </Modal>
        )}
        <Card.Group itemsPerRow='2' stackable>
          {this.state.events.map(event => {
            return (
              <Card key={event._id}>
                <Card.Content>
                  <Card.Header>{event.title}</Card.Header>
                  <Card.Meta>
                    <span className='date'>
                      {new Date(event.date).toLocaleDateString('de-DE')}
                    </span>
                  </Card.Meta>
                  <Card.Description>{event.description}</Card.Description>
                </Card.Content>
                <Card.Content extra>
                  <Icon name='pound sign' />
                  {event.price}
                </Card.Content>
                {this.context.token && (
                  <Button
                    color='green'
                    inverted
                    onClick={() => this.bookEventHandler(event._id)}
                  >
                    <Icon name='checkmark' /> Book
                  </Button>
                )}
              </Card>
            );
          })}
        </Card.Group>
      </React.Fragment>
    );
  }
}

export default EventsPage;
