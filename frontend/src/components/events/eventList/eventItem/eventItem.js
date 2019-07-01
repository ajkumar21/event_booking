import React from 'react';
import './eventItem.css';

const eventItem = props => {
  return (
    <li key={props.eventId} className='events__list-item'>
      {props.title}
    </li>
  );
};

export default eventItem;
