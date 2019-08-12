import React, { Component } from 'react';

import AuthContext from '../context/auth-context';

class BookingsPage extends Component {
  state = {
    isLoading: false,
    bookings: []
  };

  static contextType = AuthContext;

  componentDidMount() {
    this.fetchBookings();
  }

  fetchBookings = () => {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
          query {
            bookings {
              _id
             createdAt
             event {
               _id
               title
               date
             }
            }
          }
        `
    };

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.context.token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(resData => {
        const bookings = resData.data.bookings;
        this.setState({ bookings: bookings, isLoading: false });
      })
      .catch(err => {
        console.log(err);
        this.setState({ isLoading: false });
      });
  };

  onDelete = id => {
    this.setState({ isLoading: true });
    // adding variables to queries
    const requestBody = {
      query: `
          mutation CancelBooking($bookingid: ID!) {
            cancelBooking(bookingId: $bookingid) {
              _id
              title
             }
            }
          
        `,
      variables: {
        bookingid: id
      }
    };

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.context.token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(resData => {
        console.log('jere');
        this.setState(prevState => {
          const updatedBookings = prevState.bookings.filter(b => {
            return b._id !== id;
          });
          return { bookings: updatedBookings, isLoading: false };
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({ isLoading: false });
      });
  };

  render() {
    return (
      <React.Fragment>
        {/* {this.state.isLoading ? (
          <div className='spinner'>
            <div className='lds-ellipsis'>
              <div />
              <div />
              <div />
              <div />
            </div>
          </div>
        ) : (
          <BookingList
            bookings={this.state.bookings}
            onDelete={this.onDelete}
          />
        )} */}
      </React.Fragment>
    );
  }
}

export default BookingsPage;
