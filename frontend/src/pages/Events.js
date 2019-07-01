import React, { Component } from 'react';
import '../index.css';
import './Events.css';
import Backdrop from '../components/backdrop/backdrop';
import Modal from '../components/modal/modal';
import AuthContext from '../context/auth-context';
import EventList from '../components/events/eventList/eventList';

class EventsPage extends Component {
  state = {
    creating: false,
    events: [],
    isLoading: false,
    selectedEvent: null
  };

  isActive = true;

  constructor(props) {
    super(props);
    this.titleElReft = React.createRef();
    this.priceElReft = React.createRef();
    this.dateElReft = React.createRef();
    this.descriptionElReft = React.createRef();
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
    this.setState({ creating: false, selectedEvent: null });
  };

  modalConfirm = () => {
    this.setState({ creating: false });
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
          console.log(res);
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

  bookEventHandler = () => {
    if (!this.context.token) {
      this.setState({ selectedEvent: null });
      return;
    }
    const requestBody = {
      query: `
      mutation {
        bookEvent(eventId: "${this.state.selectedEvent._id}") {
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
        {this.state.creating && <Backdrop />}
        {this.state.creating && (
          <Modal
            title='Add Event'
            canCancel
            canConfirm
            onCancel={this.modalCancel}
            onConfirm={this.modalConfirm}
            confirmText='Confirm'
          >
            <form>
              <div className='form-control'>
                <label htmlFor='title'>Title</label>
                <input type='text' id='title' ref={this.titleElReft} />
              </div>
              <div className='form-control'>
                <label htmlFor='price'>Price</label>
                <input type='number' id='price' ref={this.priceElReft} />
              </div>
              <div className='form-control'>
                <label htmlFor='date'>Date</label>
                <input type='date' id='date' ref={this.dateElReft} />
              </div>
              <div className='form-control'>
                <label htmlFor='description'>Description</label>
                <textarea
                  rows='4'
                  id='description'
                  ref={this.descriptionElReft}
                />
              </div>
            </form>
          </Modal>
        )}

        {this.state.selectedEvent && <Backdrop />}
        {this.state.selectedEvent && (
          <Modal
            title={this.state.selectedEvent.title}
            canCancel
            canConfirm
            onCancel={this.modalCancel}
            onConfirm={this.bookEventHandler}
            confirmText={this.context.token ? 'Book' : 'Confirm'}
          >
            <h1>{this.state.selectedEvent.title}</h1>
            <h2>{this.state.selectedEvent.price}</h2>
            <h2>
              {new Date(this.state.selectedEvent.date).toLocaleDateString(
                'de-DE'
              )}
            </h2>
            <h3>{this.state.selectedEvent.description}</h3>
          </Modal>
        )}

        {this.context.token && (
          <div className='events-control'>
            <p>Share your own events!</p>
            <button className='btn' onClick={this.createEventHandler}>
              Create Event
            </button>
          </div>
        )}
        {this.state.isLoading ? (
          // https://loading.io/css

          <div className='spinner'>
            <div className='lds-ellipsis'>
              <div />
              <div />
              <div />
              <div />
            </div>
          </div>
        ) : (
          <EventList
            events={this.state.events}
            authUserId={this.context.userId}
            onViewDetail={this.showDetailHandler}
          />
        )}
      </React.Fragment>
    );
  }
}

export default EventsPage;
