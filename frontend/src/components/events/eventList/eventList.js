import React from 'react';
import EventItem from './eventItem/eventItem';
import './eventList.css';

const eventList = props => {
  // create list here before using in render function
  const events = props.events.map(event => {
    return (
      <EventItem key={event._id} eventId={event._id} title={event.title} />
    );
  });

  return (
    <section className='event__list'>
      <ul>{events}</ul>
    </section>
  );
};

export default eventList;
