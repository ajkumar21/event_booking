import React, { Component } from 'react';
import '../index.css';
import './Events.css';
import Backdrop from '../components/backdrop/backdrop';
import Modal from '../components/modal/modal';

class EventsPage extends Component {
  state = {
    creating: false
  };

  createEventHandler = () => {
    this.setState({ creating: true });
  };

  modalCancel = () => {
    this.setState({ creating: false });
  };

  modalConfirm = () => {
    this.setState({ creating: false });
  };

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
          >
            <p>Modal Content</p>
          </Modal>
        )}
        <div className='events-control'>
          <p>Share your own events!</p>
          <button className='btn' onClick={this.createEventHandler}>
            Create Event
          </button>
        </div>
      </React.Fragment>
    );
  }
}

export default EventsPage;
