import React, { Component } from 'react';
import '../index.css';
import './Events.css';
import Backdrop from '../components/backdrop/backdrop';
import Modal from '../components/modal/modal';
import AuthContext from '../context/auth-context';

class EventsPage extends Component {
  state = {
    creating: false,
    events: []
  };

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
    this.setState({ creating: false });
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
        creator{
          _id
          email
        }
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
        this.fetchEvents();
      })
      .catch(err => console.log(err));
  };

  fetchEvents() {
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
        this.setState({ events: events });
      })
      .catch(err => console.log(err));
  }

  render() {
    // create list here before using in render function
    const eventList = this.state.events.map(event => {
      return (
        <li key={event._id} className='events__list-item'>
          {event.title}
        </li>
      );
    });
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
        {this.context.token && (
          <div className='events-control'>
            <p>Share your own events!</p>
            <button className='btn' onClick={this.createEventHandler}>
              Create Event
            </button>
          </div>
        )}

        <section className='events__list'>
          <ul>{eventList}</ul>
        </section>
      </React.Fragment>
    );
  }
}

export default EventsPage;
